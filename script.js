window.addEventListener('load', function(){
    const canvas = this.document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 800;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.font = "20px Helvetica";
    ctx.fillStyle = 'white';

    class InputHandler {
        constructor(game) {
            this.game = game;
            window.addEventListener('keydown', (e)=>{
                if ((   (e.key === 'ArrowUp') ||
                        (e.key === 'ArrowLeft') ||
                        (e.key === 'ArrowRight') ||
                        (e.key === ' ')                
                ) && this.game.keys.indexOf(e.key) === -1) {
                    this.game.keys.push(e.key)
                }
            })
            window.addEventListener('keyup', (e)=>{
                if(this.game.keys.indexOf(e.key) > -1 ) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1)
                }
            })
        }
    }

    class Player {
        constructor(game){
            this.game = game;
            this.bodyimage = document.getElementById('spaceship');
            this.ingame = true;
            this.invincibility = true;

            this.turnSpeed = 3;
            this.acceleration = 0.5;
            this.friction = 0.99;

            this.ammo = 2;
            this.maxAmmo = 10;

            this.reloadTimer = 0
            this.reloadInterval = 50;

            this.shootingTimer = 0;
            this.shootingInterval = 10;

            this.x = this.game.width * 0.5;
            this.y = this.game.height * 0.5;
            this.spriteWidth = 60;
            this.spriteHeight = 60;
            this.radius= 30;


            this.thrust = { x:0, y:0 };
            this.speed = 0;
            this.maxSpeed = 3;
            this.angle = 270/180*Math.PI;
            this.rotation = 0;

        }

        draw(context){
            if (this.ingame){
                context.save()
                context.translate(this.x, this.y)
                context.rotate(this.angle);
                context.drawImage(this.bodyimage, 0 - this.spriteWidth * 0.5, 0 - this.spriteHeight * 0.5, this.spriteWidth, this.spriteHeight)
                context.restore()
            }
            if (this.invincibility && !this.game.gameOver) {
                context.save();
                context.strokeStyle = 'red'
                context.beginPath();
                context.arc(this.game.width * 0.5, this.game.height * 0.5, 60, 0, Math.PI*2);
                context.stroke();
                context.restore();
            }
        }
        update(deltaTime){

            if (this.ingame) {
                // Sortie de l'écran, rerentre de l'autre côté
                this.game.outOfScreenPosition(this, this.game);

                if (this.game.keys.length > 0) this.invincibility = false;
    
                // Accélération du vaisseau
                if (this.game.keys.indexOf('ArrowUp') > -1){
                    if(this.speed < this.maxSpeed) {
                        this.thrust.x += this.acceleration * Math.cos(this.angle);
                        this.thrust.y += this.acceleration * Math.sin(this.angle);
                    }
                }
    
                // Virage à gauche
                if (this.game.keys.indexOf('ArrowLeft') > -1){
                    this.rotation += -this.turnSpeed /180 * Math.PI;
                }
    
                // Virage à droite
                if (this.game.keys.indexOf('ArrowRight') > -1){
                    this.rotation += this.turnSpeed /180 * Math.PI;
                }
    
                // Lancer un projectile
                if ( (this.game.keys.indexOf(' ') > -1) && (this.allowToShoot) && (this.ammo > 0)) {
                    this.allowToShoot = false;
                    this.shootingTimer = 0;
                    this.ammo--;
                    const projectile = this.game.getFreeObject(this.game.projectilePool);
                    if(projectile) projectile.start();
                }
    
                // Gestion de la vitesse d'attaque
                if(this.shootingTimer > this.shootingInterval){
                    this.allowToShoot = true;
                    this.shootingTimer = 0;
                } else {
                    this.shootingTimer += deltaTime;
                }
    
                // Gestion de la vitesse de recharge
                if(this.reloadTimer > this.reloadInterval){ 
                    if(this.ammo < this.maxAmmo)this.ammo++;
                    this.reloadTimer = 0;
                } else {
                    this.reloadTimer += deltaTime;
                }
    
            }
            //Mise à jour de la position du vaisseau
            this.speed = Math.hypot(Math.abs(this.thrust.x), Math.abs(this.thrust.y))
            this.angle += this.rotation;
            this.thrust.x *= this.friction; 
            this.thrust.y *= this.friction;
            this.x += this.thrust.x;
            this.y += this.thrust.y;
            this.rotation = 0;
        }
        loosingLife(){
            this.ingame = false;
            this.game.lifeNumber--;
            const explosion = this.game.getFreeObject(this.game.explosionPool);
            if (explosion) explosion.start()
        }
        reset(){
            this.ingame = true;
            this.x = this.game.width * 0.5;
            this.y = this.game.height * 0.5;
            this.thrust = { x:0, y:0 };
            this.speed = 0;
            this.angle = 270/180*Math.PI;
            this.rotation = 0;
            this.invincibility = true;
        }
    }

    class Projectile {
        constructor(game){
            this.game = game;
            
            this.radius = 5;

            this.x = 0;
            this.y = 0;
            this.speed = 5;
            this.angle = 0;
            this.free = true;
            this.maxdistance = 0.3;
            this.distance = 0;
        }
        draw(/** @type {CanvasRenderingContext2D}*/context){
            if(!this.free){
                context.save();
                context.fillStyle = 'red'
                context.beginPath();
                context.arc(this.x, this.y, this.radius, 0, Math.PI*2)
                context.fill();
                context.restore();
            }
        }
        update(){
            if(!this.free){

                if (this.distance > this.maxdistance * game.width){
                    this.reset();
                }

                // Sortie de l'écran, rerentre de l'autre côté
                this.game.outOfScreenPosition(this, this.game);

                this.x += this.speed * Math.cos(this.angle);
                this.y += this.speed * Math.sin(this.angle);

                this.distance += Math.hypot(this.speed * Math.cos(this.angle),this.speed * Math.sin(this.angle))
            }
        }
        reset(){
            this.free = true;
        }
        start(){
            this.distance = 0;
            this.angle = this.game.player.angle
            this.free = false;
            this.x = this.game.player.x + Math.cos(this.angle) * this.game.player.radius;
            this.y = this.game.player.y + Math.sin(this.angle) * this.game.player.radius;
        }
    }

    class Asteroid {
        constructor(game) {
            this.game = game;
            this.image = document.getElementById('asteroid');

            this.radius = 60;
            this.x = Math.random() * this.game.width;
            this.y = Math.random() * this.game.height;
            
            this.spriteWidth = 120;
            this.spriteHeight = 122;

            this.speed = 1;
            this.free = true;
            this.rotationAngle = 0;
            this.directionAngle= Math.random() * Math.PI * 2;
            this.va = Math.random() * 0.04 - 0.02;
        }
        draw(context){
            if(!this.free){
                context.save();
                context.translate(this.x, this.y)
                context.rotate(this.rotationAngle);
                context.drawImage(this.image, 0 - this.spriteWidth * 0.5, 0 - this.spriteHeight *0.5, this.spriteWidth, this.spriteHeight);
                context.restore();
            }
        }
        update(){
            if (!this.free){
                this.rotationAngle += this.va;
                // Sortie de l'écran, rerentre de l'autre côté
                this.game.outOfScreenPosition(this, this.game);

                this.x += this.speed * Math.cos(this.directionAngle);
                this.y += this.speed * Math.sin(this.directionAngle);
            }
        }
        reset(){
            this.free = true;
        }
        start(){
            this.free = false;
            this.x = Math.random() * this.game.width;
            this.y = Math.random() * this.game.height;
        }
    }

    class Explosion {
        constructor(game){
            this.game = game;
            this.image = document.getElementById('explosion');
            this.x = 0;
            this.y = 0;
            this.speed = 0;
            this.directionAngle= 0;
            this.spriteWidth = 300;
            this.spriteHeight = 300;
            this.free = true;
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 3);
            this.maxFrame = 22;
            this.animationTimer = 0;
            this.animationInterval = 1000/80;
            this.zoomCoef = 0.8;
        }
        draw(context){
            if(!this.free){
                context.drawImage(this.image, 
                this.spriteWidth * this.frameX, this.spriteHeight * this.frameY, 
                this.spriteWidth, this.spriteHeight, 
                this.x - this.spriteWidth * this.zoomCoef * 0.5, this.y - this.spriteHeight * this.zoomCoef * 0.5, 
                this.spriteWidth *this.zoomCoef , this.spriteHeight * this.zoomCoef )
            }
        }
        update(deltaTime){
            if(!this.free){
                this.x += this.speed * Math.cos(this.directionAngle);
                this.y += this.speed * Math.sin(this.directionAngle);
                
                if(this.animationTimer > this.animationInterval){
                    this.frameX++;
                    this.animationTimer = 0;
                    if (this.frameX > this.maxFrame) this.reset();
                } else {
                    this.animationTimer += deltaTime;
                }
            }
        }
        reset(){
            this.free = true;
        }
        start(x, y, speed, angle){
            this.free = false;
            this.x = x;
            this.y = y;
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 3);
            this.speed = speed;
            this.directionAngle = angle;
        }
    }

    class UI{
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Bangers';
            this.color = 'white'
        }

        draw(context) {
            context.save();
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;
            // Score
            context.fillText(`Score: ${game.score}` , 20, 35)

            // Lives
            context.fillText(`Vies: ${game.lifeNumber}` , 1100, 35)

            // Munitions
            for (let i = 0 ; i < this.game.player.ammo; i++){
                    context.fillStyle = 'red'
                    context.beginPath();
                    context.arc(30 + 20 * i, 50, 5, 0, Math.PI*2)
                    context.fill();
            }

            // GameOver messages 
            if (this.game.gameOver) {
                context.textAlign = 'center'
                
                let message1;
                let message2;
                
                context.fillStyle = 'red'
                message1 = 'Terminé !';
                message2 = `Score: ${game.score}`;
                
                context.font = '50px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
            }

            context.restore();
        }
    }

    class Game {
        constructor(canvas){

            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;

            this.asteroidPool = [];
            this.explosionPool = [];
            this.projectilePool = [];

            this.player = new Player(this)
            this.input = new InputHandler(this)
            this.ui = new UI(this)
            this.keys = [];

            this.lifeNumber = 3;
            this.gameOver = false;
            this.score = 0;
            
            this.gameTime = 0;
            this.timeLimit = 10000;
            this.fpsTimer =0;
            this.fps = 80;

           
            this.maxAsteroids = 10;
            this.createObjectPool(this.asteroidPool, this.maxAsteroids, Asteroid);

            this.init(); 
             
            this.maxExplosions = 5;
            this.createObjectPool(this.explosionPool, this.maxExplosions, Explosion);

            this.maxProjectiles = 10;
            this.createObjectPool(this.projectilePool, this.maxProjectiles, Projectile);
        }

        createObjectPool(objectPool, maxObject, Object){
            for (let i=0; i < maxObject; i++) {
                objectPool.push(new Object(this))
            }
        }

        getFreeObject(objectPool){
            for (let i=0; i < objectPool.length; i++){
                if (objectPool[i].free) {
                    return objectPool[i];
                }
            }
        }
        outOfScreenPosition(object, game){
                if (object.x > game.width + object.radius) object.x = 0 - object.radius;
                if (object.x + object.radius < 0) object.x = game.width + object.radius;
                if (object.y > game.height + object.radius) object.y = 0 - object.radius;
                if (object.y + object.radius < 0) object.y = game.height + object.radius;
        }
        
        init(){
            for (let i = 0; i < this.maxAsteroids; i++){
                const asteroid = this.getFreeObject(this.asteroidPool);
                if (asteroid) asteroid.start();
            }
        }
        
        checkCollision(a, b) {
            const sumOfRadius = a.radius + b.radius;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distance = Math.hypot(dx, dy);
            return distance < sumOfRadius;
        }

        render(context, deltaTime){
            // GAME OVER IF LIFE = 0
            if (this.lifeNumber <= 0){
                this.gameOver = true;
                this.player.ingame = false;
            }

            // GAME OVER IF NO MORE ASTEROID
            const asteroidLeft = this.asteroidPool.filter((astero) => astero.free === false).length;
            if (asteroidLeft === 0) {
                this.gameOver = true;
                this.player.ingame = false;
            }

            if (this.fpsTimer > 1000 / this.fps) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                 
                this.asteroidPool.forEach(asteroid => {
                    asteroid.draw(context);
                    asteroid.update();
                });
                this.explosionPool.forEach(explosion => {
                    explosion.draw(context);
                    explosion.update(deltaTime);
                });
                this.projectilePool.forEach(projo => {
                    projo.draw(context);
                    projo.update(); 
                })
                this.player.draw(context);
                this.player.update(deltaTime);
    
                this.ui.draw(context);

                this.fpsTimer = 0;

            } else {
                this.fpsTimer += deltaTime;
            }
        }
        collisionLoop(){
            this.asteroidPool.forEach(astero=>{
                this.projectilePool.forEach(projecto=>{
                    if (!astero.free && !projecto.free && this.checkCollision(astero, projecto)) {
                        const explosion = this.getFreeObject(this.explosionPool);
                        if (explosion) explosion.start(astero.x, astero.y, astero.speed * 0.5, astero.directionAngle);
                        astero.reset();
                        projecto.reset();
                        this.score++
                    }
                })
            })
        }
        collisionPlayerAsterosLoop(){
            if (!this.player.invincibility){
                this.asteroidPool.forEach(astero=>{
                    if (!astero.free && this.checkCollision(astero, this.player) && this.player.ingame){
                        this.player.ingame = false;
                        this.lifeNumber--;
                        const explosion = this.getFreeObject(this.explosionPool);
                        if (explosion) explosion.start(this.player.x,this.player.y, this.player.speed, this.player.angle);
                        this.player.reset();
                    }
                })
            }
        }
    }

    const game = new Game(canvas)
    
    let lastTime = 0;
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.render(ctx, deltaTime);
        game.collisionLoop();
        game.collisionPlayerAsterosLoop();
        requestAnimationFrame(animate)
    }
    animate(0);
    
})
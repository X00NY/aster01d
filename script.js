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

            this.turnSpeed = 5;
            this.acceleration = 4;
            this.friction = 0.99;

            this.x = this.game.width * 0.5;
            this.y = this.game.height * 0.5;
            this.spriteWidth = 60;
            this.spriteHeight = 60;
            this.thrust = { x:0, y:0 };
            this.angle = 270/180*Math.PI;
            this.rotation = 0;

        }

        draw(context){
            context.save()
            context.translate(this.x, this.y)
            context.rotate(this.angle);
            context.drawImage(this.bodyimage, 0 - this.spriteWidth * 0.5, 0 - this.spriteHeight * 0.5, this.spriteWidth, this.spriteHeight)
            context.restore()
        }
        update(){
            this.rotation = 0;
            this.thrust.x = this.thrust.x * this.friction; 
            this.thrust.y = this.thrust.y * this.friction; 

            // Sortie de l'écran, rerentre de l'autre côté
            if (this.x > this.game.width + this.spriteWidth * 0.5) this.x = 0 - this.spriteWidth *0.5;
            if (this.x + this.spriteWidth * 0.5 < 0) this.x = this.game.width + this.spriteWidth * 0.5;
            if (this.y > this.game.height + this.spriteHeight * 0.5) this.y = 0 - this.spriteHeight *0.5;
            if (this.y + this.spriteHeight * 0.5 < 0) this.y = this.game.height + this.spriteHeight * 0.5;

            if (this.game.keys.indexOf('ArrowUp') > -1){
                this.thrust.x = this.acceleration * Math.cos(this.angle);
                this.thrust.y = this.acceleration * Math.sin(this.angle);
            }
            if (this.game.keys.indexOf('ArrowLeft') > -1){
                this.rotation = -this.turnSpeed /180 * Math.PI;
            }
            if (this.game.keys.indexOf('ArrowRight') > -1){
                this.rotation = this.turnSpeed /180 * Math.PI;
            }
            if ( this.game.keys.indexOf(' ') > -1) {
                console.log('Pew Pew');
            }
            this.angle += this.rotation;
            this.x += this.thrust.x;
            this.y += this.thrust.y;

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
                if (this.x > this.game.width + this.spriteWidth * 0.5) this.x = 0 - this.spriteWidth *0.5;
                if (this.x + this.spriteWidth * 0.5 < 0) this.x = this.game.width + this.spriteWidth * 0.5;
                if (this.y > this.game.height + this.spriteHeight * 0.5) this.y = 0 - this.spriteHeight *0.5;
                if (this.y + this.spriteHeight * 0.5 < 0) this.y = this.game.height + this.spriteHeight * 0.5;
    
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
            this.animationInterval = 1000/35;
        }
        draw(context){
            if(!this.free){
                context.drawImage(this.image, 
                this.spriteWidth * this.frameX, this.spriteHeight * this.frameY, 
                this.spriteWidth, this.spriteHeight, 
                this.x - this.spriteWidth * 0.5, this.y - this.spriteHeight * 0.5, 
                this.spriteWidth, this.spriteHeight)
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
        start(x, y, asteroSpeed, asteroDirectionAngle){
            this.free = false;
            this.x = x;
            this.y = y;
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 3);
            this.speed = asteroSpeed;
            this.directionAngle = asteroDirectionAngle;
        }
    }

    class Game {
        constructor(canvas){
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.player = new Player(this)
            this.input = new InputHandler(this)

            this.score = 0;
            this.asteroidPool = [];
            
            this.maxAsteroids = 10;

            this.keys = [];
            this.createAsteroidPool();
            this.init();

            this.mouse = {
                x: 0,
                y: 0,
                radius: 2
            }

            this.explosionPool = [];
            this.maxExplosions = 5;
            this.createExplosionPool();

            window.addEventListener('click', (e)=>{
                // add explosion at click coordonates
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.asteroidPool.forEach(asteroid => {
                    if (!asteroid.free && this.checkCollision(asteroid, this.mouse)){
                        const explosion = this.getExplosion();
                        if (explosion) explosion.start(asteroid.x, asteroid.y, asteroid.speed * 0.5, asteroid.directionAngle);
                        asteroid.reset()
                        this.score++
                    }
                })
            })
        }
        createAsteroidPool(){
            for (let i=0; i< this.maxAsteroids; i++){
                this.asteroidPool.push(new Asteroid(this));
            }
        }
        createExplosionPool(){
            for (let i=0; i< this.maxExplosions; i++){
                this.explosionPool.push(new Explosion(this));
            }
        }
        getAsteroid(){
            for (let i=0; i < this.asteroidPool.length; i ++) {
                if (this.asteroidPool[i].free) {
                    return this.asteroidPool[i]
                }
            }
        }
        init(){
            this.asteroidPool.forEach(() => {
                const asteroid = this.getAsteroid();
                if (asteroid) asteroid.start();
            })
        }
        getExplosion(){
            for (let i = 0; i < this.explosionPool.length; i++) {
                if (this.explosionPool[i].free){
                    return this.explosionPool[i]
                }
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
            this.asteroidPool.forEach(asteroid => {
                asteroid.draw(context);
                asteroid.update();
            });
            this.explosionPool.forEach(explosion => {
                explosion.draw(context);
                explosion.update(deltaTime);
            });
            this.player.draw(context);
            this.player.update();
            
            context.fillText(`Score: ${this.score}` , 20, 35)
        }
    }

   

    const game = new Game(canvas)
    
    let lastTime = 0;
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx, deltaTime);
        requestAnimationFrame(animate)
    }
    animate(0);
    
})
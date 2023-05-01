window.addEventListener('load', function(){
    const canvas = this.document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 800;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;

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

            this.turnSpeed = 3;
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
            this.radius = 60;
            this.x = Math.random() * this.game.width;
            this.y = Math.random() * this.game.height;
            this.image = document.getElementById('asteroid');
            this.spriteWidth = 120;
            this.spriteHeight = 122;
            this.speed = 1;
            this.rotationAngle = 0;
            this.directionAngle= Math.random() * Math.PI * 2;
            this.va = Math.random() * 0.04 - 0.02;
        }
        draw(context){
            context.save();
            context.translate(this.x, this.y)
            context.rotate(this.rotationAngle);
            context.drawImage(this.image, 0 - this.spriteWidth * 0.5, 0 - this.spriteHeight *0.5, this.spriteWidth, this.spriteHeight);
            context.restore();
        }
        update(){
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

    class Game {
        constructor(canvas){
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.player = new Player(this)
            this.input = new InputHandler(this)
            this.asteroidPool = [];
            this.max = 5;
            this.keys = [];
            this.createAsteroidPool();
        }
        createAsteroidPool(){
            for (let i=0; i< this.max; i++){
                this.asteroidPool.push(new Asteroid(this));
            }
        }
        render(context){
            this.asteroidPool.forEach(asteroid => {
                asteroid.draw(context);
                asteroid.update();
            });
            this.player.draw(context);
            this.player.update();
        }
    }

   

    const game = new Game(canvas)
    

    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx);
        requestAnimationFrame(animate)
    }
    animate();
    
})
window.addEventListener('load', function(){
    const canvas = this.document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;

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
            this.acceleration = 2;
            this.friction = 0.99;

            this.x = this.game.width * 0.5 - this.bodyimage.width * 0.5;
            this.y = this.game.height * 0.5 - this.bodyimage.height * 0.5;
            this.thrust = { x:0, y:0 };
            this.angle = 0;
            this.rotation = 0;

        }

        draw(context){
            context.save()
            context.translate(this.x + this.bodyimage.width * 0.5, this.y + this.bodyimage.height * 0.5)
            context.rotate(this.angle);
            context.drawImage(this.bodyimage, - this.bodyimage.width * 0.5, - this.bodyimage.height * 0.5, 50,50)
            context.restore()
        }
        update(){
            this.rotation = 0;
            this.thrust.x = this.thrust.x * this.friction; 
            this.thrust.y = this.thrust.y * this.friction; 

            if (this.x > this.game.width) this.x = 0 - this.bodyimage.width;
            if (this.x + this.bodyimage.width < 0) this.x = this.game.width;
            if (this.y > this.game.height) this.y = 0 - this.bodyimage.height;
            if (this.y + this.bodyimage.height < 0) this.y = this.game.height;

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

    class Game {
        constructor(canvas){
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.player = new Player(this)
            this.input = new InputHandler(this)
            this.keys = [];
        }
        update(){
            this.player.update();
        }
        draw(context){
            this.player.draw(context)
        }
    }

   

    const game = new Game(canvas)
    

    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update();
        game.draw(ctx);
        requestAnimationFrame(animate)
    }
    animate();


    
})
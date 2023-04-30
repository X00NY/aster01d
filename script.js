window.addEventListener('load', function(){
    const canvas = this.document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;

    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';

    class Player {
        constructor(game){
            this.game = game;
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 30;
        }

        draw(context){
            context.beginPath();
            context.arc(this.collisionX,this.collisionY,this.collisionRadius,0,Math.PI * 2);
            context.save();
            context.globalAlpha = 0.5;
            context.fill();
            context.restore();
            context.stroke();
        }
        update(){
           this.collisionX = this.game.mouse.x; 
           this.collisionY = this.game.mouse.y; 
        }
    }

    class Game {
        constructor(canvas){
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.player = new Player(this)
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }

            // event listeners
            canvas.addEventListener('mousedown', (e)=>{
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = true;
            })
            canvas.addEventListener('mouseup', (e)=>{
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = false;
            })
            canvas.addEventListener('mousemove', (e)=>{
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
            })
        }
        render(context){
            this.player.draw(context)
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
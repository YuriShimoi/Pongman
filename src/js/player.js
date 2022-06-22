class Player extends Figure {
    velocity = 1;
    direction = { 'x': 0, 'y': 0 };
    frame_direction = 1;
    _register_shield = true;
    _canMove = true;
    frame_counter = 0;
    frame_cooldown = 20;
    endGame = () => {};

    constructor() {
        super("src/img/player2.png", 32, 32);
        this.tags.push("player");

        this.setCollisionBox([
            [16, 6], [25, 10], [25, 22],
            [16, 26], [7, 22], [7, 10]
        ]);

        // this.shield = new Shield();
    }

    receiveMessage(message) {
        if(message === 0) {
            // end
            this._canMove = false;
        }
        if(message === -1) {
            this.endGame();
        }
    }

    update() {
        if(this._canMove) {
            this.move();
            // if(this._register_shield) {
            //     this._register_shield = false;
            //     this.requestRegister(this.shield);
            // }
        }
    }

    move() {
        if(KeyControl.isPressed('w') || KeyControl.isPressed('s')
        || KeyControl.isPressed('up') || KeyControl.isPressed('down')) {
            if(KeyControl.isPressed('w') || KeyControl.isPressed('up')) this.direction.y = -1;
            if(KeyControl.isPressed('s') || KeyControl.isPressed('down')) this.direction.y =  1;
        }
        else {
            this.direction.y = 0;
        }
        if(KeyControl.isPressed('a') || KeyControl.isPressed('d')
        || KeyControl.isPressed('left') || KeyControl.isPressed('right')) {
            if(KeyControl.isPressed('a') || KeyControl.isPressed('left')) this.direction.x = -1;
            if(KeyControl.isPressed('d') || KeyControl.isPressed('right')) this.direction.x =  1;
        }
        else {
            this.direction.x = 0;
        }

        if((this.direction.x != 0 || this.direction.y != 0)
         && this.tryMove(this.direction.x * this.velocity, this.direction.y * this.velocity, ['wall'])) {
            let pos = this.getPosition();
            // this.shield.move(pos.x, pos.y);
            this.nextFrame();
        }
        else {
            this.frame_counter = 0;
            this.updateAnimationFrame();
        }
    }

    nextFrame() {
        this.checkDirection();
        this.updateAnimationFrame();
        // this.shield.setDirection(this.frame_direction);
    }

    checkDirection() {
        /*  7 0 1
            6   2
            5 4 3  */
        let frameDirection = {
            '0' : { '-1': 0, '1' : 4 },
            '1' : { '-1': 1, '0' : 2, '1' : 3 },
            '-1': { '-1': 7, '0' : 6, '1' : 5 }
        };

        this.frame_direction = frameDirection[this.direction.x][this.direction.y];
    }

    updateAnimationFrame() {
        this.frame_counter++;
        if(this.frame_counter >= 3 * this.frame_cooldown) {
            this.frame_counter = 0;
        }

        let newDir = this.frame_direction * this.getSize().height;
        let size = this.getSize();
        this.getTexture().setFrame(parseInt(this.frame_counter / this.frame_cooldown) * size.width, newDir);
    }
}


class Shield extends Figure {
    collisions = [
        [[10,2] ,[55,2] ,[55,19],[10,19]],
        [[34,0] ,[63,29],[54,38],[25,7]],
        [[43,9] ,[62,9] ,[62,55],[43,55]],
        [[64,32],[34,64],[27,54],[55,25]],
        [[10,44],[55,44],[55,62],[10,62]],
        [[9,25] ,[39,55],[30,64],[0,34]],
        [[2,9]  ,[21,9] ,[21,55],[2,55]],
        [[29,1] ,[38,9] ,[10,39] ,[0,29]]
    ];

    constructor() {
        super("", 64, 64);
        this.tags = ["shield"];
    }

    move(x, y) {
        this.setPosition(x, y);
    }

    setDirection(dir) {
        /*  7 0 1
            6   2
            5 4 3  */
        this.setCollisionBox(this.collisions[dir]);
    }
}
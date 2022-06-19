class Turret extends Figure {
    shootDirection = 0;
    cooldown = 350;
    counter = 0;

    constructor(direction) {
        super("", 90, 90);
        this.tags.push("turret");
        this.shootDirection = direction;

        this.counter = parseInt(Math.random() * 300);
        this.setTexture("src/img/turret.png", 90, 90);
        this.getTexture().setFrame(0, this.shootDirection*90);
        this.setSquareCollisionBox(0,0,0,0);
    }

    update() {
        this.counter += parseInt((Math.random() * 10) - 3);
        if(this.counter >= 100) {
            this.getTexture().setFrame(0, this.shootDirection*90);
        }

        if(this.counter >= this.cooldown) {
            this.getTexture().setFrame(90, this.shootDirection*90);
            this.counter = 0;
            this.shoot();
        }
    }

    shoot() {
        let newBullet = new Bullet(this.shootDirection);
        let turPos = this.getPosition();
        let turSiz = this.getSize();
        newBullet.setPosition((turPos.x + turSiz.width/2) - 12, (turPos.y + turSiz.height/2) - 12, turPos.z-1);
        this.requestRegister(newBullet);
    }
}


class Bullet extends Figure {
    counter = 0;
    cooldown = 600;

    constructor(direction=0, velocity=7) {
        super("", 24, 24);
        this.tags.push("bullet");
        this.setTexture("src/img/bullet.png", 32, 32);
        this.setSquareCollisionBox(2, 2, 20, 20);
        
        this.direction = direction;
        this.velocity = velocity;
    }

    update() {
        this.move();

        if(this.counter++ >= this.cooldown) {
            this.kill();
        }
    }

    move() {
        let moveDir = { 'x': 0, 'y': 0 }
        switch(this.direction) {
            case 0:
                moveDir.y = -1;
                break;
            case 1:
                moveDir.x = 1;
                break;
            case 2:
                moveDir.y = 1;
                break;
            case 3:
                moveDir.x = -1;
                break;
        }
        this.tryMove(moveDir.x * this.velocity, moveDir.y * this.velocity);
    }
    
    whenCollide(obj) {
        if(obj.tags.includes("player")) {
            obj.sendMessage(-1);
            this.kill();
        }
        if(!this.bounce && obj.tags.includes("shield")) {
            this.bounce = true;
            this.direction = this.direction+2 > 3? this.direction+2 - 4: this.direction+2;
        }
        if(obj.tags.includes("wall")) {
            this.kill();
        }
    }
}
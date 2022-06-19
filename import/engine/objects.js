class SceneObject {
    static _gen_id = 0;

    _position = {};
    _size = {};
    _update_promises = {};
    _update_promises_args = {};
    _debug_color = "#ff0000";
    _sceneDepthUpdate = () => { };

    constructor(x=0, y=0, sw=16, sh=16, z=0, tags=[]) {
        this.id = SceneObject._gen_id++;

        this._position.x = x;
        this._position.y = y;
        this._position.z = z;
        this._size.width  = sw;
        this._size.height = sh;
        this.tags = tags;
    }

    frameUpdate() { }

    update() { }

    requestRegister() { }

    kill() { }

    receiveMessage() { }

    sendMessage(...args) {
        this.receiveMessage(...args);
    }

    getPosition() {
        return this._position;
    }
    setPosition(x, y, z=null) {
        this._position.x = x;
        this._position.y = y;
        if(z !== null && z !== this._position.z) {
            this._position.z = z;
            this._sceneDepthUpdate(this);
        }

        this.updatePromises();
    }

    getSize() {
        return this._size;
    }
    setSize(w, h) {
        this._size.width  = w;
        this._size.height = h;

        this.updatePromises();
    }

    updatePromises() {
        for(let pid in this._update_promises) {
            this._update_promises[pid](...this._update_promises_args[pid]);
        }
    }

    registerPromise(pid, f, ...args) {
        this._update_promises[pid] = f;
        this._update_promises_args[pid] = args;
    }

    forgetPromise(pid) {
        delete this._update_promises[pid];
        delete his._update_promises_args[pid];
    }
}


class Texture {
    _framePosition = { 'x': 0, 'y': 0 };
    _image = new Image();

    constructor(resource="", width=16, height=16) {
        this._image.src = resource;
        this._image.width = width;
        this._image.height = height;

        this.resource_location = resource;
        this.width = width;
        this.height = height;
    }

    setFrame(px, py) {
        this._framePosition = {
            'x': px,
            'y': py
        };
    }

    getFrame() {
        return this._framePosition;
    }

    getImage() {
        return this._image;
    }
}


class Tile extends SceneObject {
    _texture = new Texture();
    _collision_box = [];
    _collision_box_subdivided = [];
    _objects_to_collide = [];
    _counter_check_collision = true;

    constructor(texture="", width=16, height=16, z=1, tags=["wall"], collision_box=null) {
        super(0, 0, width, height, z, tags);
        this.setTexture(texture, width, height);
        
        if(collision_box == null) {
            this.setSquareCollisionBox(0, 0, width, height);
        }
        else {
            this.setCollisionBox(collision_box);
        }
    }

    setTexture(resource, width=16, height=16) {
        this._texture = new Texture(resource, width, height);
    }

    getTexture() {
        return this._texture;
    }

    getCollisionBox() {
        return this._collision_box;
    }

    getCollisionBoxSubdivided() {
        return this._collision_box_subdivided;
    }

    setCollisionBox(dots) {
        // EVERY dot array must be in clockwise
        this._collision_box = dots.map(d => ({'x': d[0], 'y': d[1]}));

        this._collision_box_subdivided = [];
        
        let pivot = 0;
        let uncovered_dot = new Array(this._collision_box.length).fill(0).map((_,i) => i);
        let iterations = 0;
        while(uncovered_dot.length >= 3) {
            if(iterations++ >= 1000) {
                console.error("too many iterations, uncovered dots: ", uncovered_dot);
                break;
            }

            let midPivot = pivot+1 >= uncovered_dot.length? pivot+1 - uncovered_dot.length: pivot+1;
            let next1 = this._collision_box[uncovered_dot[midPivot]];

            let lstPivot = pivot+2 >= uncovered_dot.length? pivot+2 - uncovered_dot.length: pivot+2;
            let next2 = this._collision_box[uncovered_dot[lstPivot]];

            if(this._validSubdivideAngle(this._collision_box[uncovered_dot[pivot]], next1, next2)
            && !this._hasBetweenDots(uncovered_dot[pivot], uncovered_dot[midPivot], uncovered_dot[lstPivot])) {
                this._collision_box_subdivided.push([
                    this._collision_box[uncovered_dot[pivot]], next1, next2
                ]);
                uncovered_dot.splice(midPivot, 1);
            }

            if(++pivot >= uncovered_dot.length) {
                pivot = 0;
            }
        }
    }

    _validSubdivideAngle(firstDot, middleDot, lastDot) {
        let toMid = this._calcDotAngle(firstDot, middleDot, true);
        let toLst = this._calcDotAngle(firstDot, lastDot, true);
        
        return ((toLst - toMid) >= 0) && ((toLst - toMid) <= Math.PI);
    }

    _hasBetweenDots(ind1, ind2, ind3) {
        let strAngle1 = this._calcDotAngle(this._collision_box[ind1], this._collision_box[ind2]);
        let endAngle1 = this._calcDotAngle(this._collision_box[ind1], this._collision_box[ind3]);

        let strAngle2 = this._calcDotAngle(this._collision_box[ind2], this._collision_box[ind3]);
        let endAngle2 = this._calcDotAngle(this._collision_box[ind2], this._collision_box[ind1]);

        for(let d in this._collision_box) {
            if(d == ind1 || d == ind2 || d == ind3) {
                continue;
            }

            if(this._checkCollisionDot(this._collision_box[ind1], strAngle1, endAngle1, this._collision_box[d])) {
                if(this._checkCollisionDot(this._collision_box[ind2], strAngle2, endAngle2, this._collision_box[d])) {
                    return true;
                }
            }
        }

        return false;
    }

    setSquareCollisionBox(x, y, width, height) {
        let dots = [];
        dots.push([x, y]);
        dots.push([x+width, y]);
        dots.push([x+width, y+height]);
        dots.push([x, y+height]);
        this.setCollisionBox(dots);
    }

    _checkCollisions() {
        for(let obj in this._objects_to_collide) {
            if(this._hasCollision(this, this._objects_to_collide[obj], this._counter_check_collision)) {
                this.whenCollide(this._objects_to_collide[obj]);
            }
        }
    }

    whenCollide(obj) { }

    _hasCollision(obj1, obj2, counter_check=false) {
        let cb1 = obj1.getCollisionBox();
        let ps1 = obj1.getPosition();
        let cb2 = obj2.getCollisionBoxSubdivided();
        let ps2 = obj2.getPosition();

        let subsFlag = false;
        for(let tb in cb2) {
            let collideFlag = true;
            let validDots = new Array(cb1.length).fill(true);
            for(let d=0; d < cb2[tb].length; d+=2) {
                let prevDot = d == 0? {...cb2[tb][cb2[tb].length-1]}: {...cb2[tb][d-1]};
                prevDot.x += ps2.x;
                prevDot.y += ps2.y;
    
                let nextDot = d == cb2[tb].length-1? {...cb2[tb][0]}: {...cb2[tb][d+1]};
                nextDot.x += ps2.x;
                nextDot.y += ps2.y;
    
                let zeroDot = {...cb2[tb][d]};
                zeroDot.x += ps2.x;
                zeroDot.y += ps2.y;
                
                let strAngle = this._calcDotAngle(zeroDot, nextDot);
                let endAngle = this._calcDotAngle(zeroDot, prevDot);
    
                for(let t in cb1) {
                    if(!validDots[t]) {
                        continue;
                    }
                    
                    let tgtDot = {...cb1[t]};
                    tgtDot.x += ps1.x;
                    tgtDot.y += ps1.y;
                    validDots[t] = this._checkCollisionDot(zeroDot, strAngle, endAngle, tgtDot);
                }
    
                if(!validDots.includes(true)) {
                    collideFlag = false;
                    break;
                }
            }

            if(collideFlag) {
                subsFlag = true;
                break;
            }
        }

        if(!subsFlag && counter_check) {
            return this._hasCollision(obj2, obj1, false);
        }

        return subsFlag;
    }

    _checkCollisionDot(dotZero, strAngle, endAngle, dotTarget) {
        let trgAngle = this._calcDotAngle(dotZero, dotTarget);

        if(strAngle > endAngle) {
            return (trgAngle > strAngle && trgAngle < (endAngle+2*Math.PI))
                || (trgAngle > (strAngle-2*Math.PI) && trgAngle < endAngle);
        }
        return trgAngle > strAngle && trgAngle < endAngle;
    }

    _calcDotAngle(dot1, dot2, onlyPositive=false) {
        let angle = Math.atan2(dot2.y - dot1.y, dot2.x - dot1.x);
        if(onlyPositive && angle < 0)
            angle += 2*Math.PI;
        return angle;
    }
}


class Figure extends Tile {
    constructor(texture="", width=16, height=16, z=10, tags=["object"]) {
        super(texture, width, height, z, tags);
    }

    tryMove(x, y, preventTags=[], tryStrict=false) {
        let pos = {...this.getPosition()};
        this.setPosition(pos.x + x, pos.y + y);

        let validMove = !this._isCollidingWith(preventTags);
        if(!validMove) {
            this.setPosition(pos.x, pos.y);

            if(!tryStrict) {
                validMove = this.tryMove(x, 0, preventTags, true);
                if(!validMove) {
                    return this.tryMove(0, y, preventTags, true);
                }
            }
        }
        return validMove;
    }

    _isCollidingWith(tags) {
        let toCollide = this._objects_to_collide.filter(obj => {
            return obj.tags.some(otg => tags.includes(otg));
        });

        for(let obj in toCollide) {
            if(this._hasCollision(this, toCollide[obj], this._counter_check_collision)) {
                return true;
            }
        }
        return false;
    }
}
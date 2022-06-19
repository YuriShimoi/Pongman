class Engine {
    static framerate = 60;
    static _running_scene_interval = null;
    static enginerate = 120;
    static _running_engine_interval = null;
    static _running_scene = null;

    static _collision_tags = {
        'object': ['wall', 'object']
    };

    static run(scene) {
        if(Engine._running_scene_interval)
            clearInterval(Engine._running_scene_interval);
        if(Engine._running_engine_interval)
            clearInterval(Engine._running_engine_interval);

        this._running_scene = scene;
        scene._setTagRules(this._collision_tags);
        Engine._running_scene_interval = setInterval(() => {
            scene.draw();
        }, 1000/Engine.framerate);
        
        Engine._running_engine_interval = setInterval(() => {
            scene.update();
            KeyControl.runHolders();
        }, 1000/Engine.enginerate);

        // modules initialization
        KeyControl.start();
    }

    static setCollideTag(tg1, tg2, hasCollision=true) {
        if(hasCollision) {
            if(tg1 in this._collision_tags) {
                if(!this._collision_tags[tg1].includes(tg2)) {
                    this._collision_tags[tg1].push(tg2);
                }
            }
            else {
                this._collision_tags[tg1] = [tg2];
            }
        }
        else {
            if(tg1 in this._collision_tags && this._collision_tags[tg1].includes(tg2)) {
                this._collision_tags[tg1].splice(this._collision_tags[tg1].indexOf(tg2), 1);
            }
        }
        
        this._running_scene?._setTagRules(this._collision_tags);
    }
}


class Scene {
    static _gen_id = 0;
    _objects = [];
    _objects_by_tag = {};

    _canvas = null;
    _context = null;

    _draw_debug = false;
    _collision_tags = {};
    _draw_collisions = false;
    _collision_color = "#0000ff55";

    constructor(cnv=null) {
        this.id = Scene._gen_id++;
        this.camera = new Camera();

        if(cnv !== null) {
            this._canvas = typeof cnv === "string"? document.getElementById(cnv): cnv;
            this._context = this._canvas.getContext("2d");
            this._setCameraCanvasSize();
        }
    }

    setCanvas(cnv) {
        this._canvas = cnv instanceof String? document.getElementById(cnv): cnv;
        this._context = this._canvas.getContext("2d");
        this._setCameraCanvasSize();
    }

    _setCameraCanvasSize() {
        this.camera.setSize(this._canvas.width, this._canvas.height);
    }

    registerObject(obj, px=null, py=null) {
        if(px !== null & py !== null) {
            obj.setPosition(px, py);
        }

        let added_flag = false;
        for(let i in this._objects) {
            if(this._objects[i].getPosition().z >= obj.getPosition().z) {
                this._objects.splice(i, 0, obj);
                added_flag = true;
                break;
            }
        }
        if(!added_flag) {
            this._objects.push(obj);
        }

        this._registerOrdenedByTag(obj);

        obj._sceneDepthUpdate = (uobj) => {
            this._orderObjectDepth(uobj);
        };

        obj.requestRegister = (robj) => {
            this.registerObject(robj);
            this._setTagRules(this._collision_tags);
        };

        obj.kill = () => {
            this.delete(obj);
        };
    }

    delete(obj) {
        let objIndex = this._objects.findIndex(o => o.id == obj.id);
        this._objects.splice(objIndex, 1);

        for(let t in obj.tags) {
            let oInd = this._objects_by_tag[obj.tags[t]].findIndex(o => o.id == obj.id);
            this._objects_by_tag[obj.tags[t]].splice(oInd, 1);
        }
    }

    _orderObjectDepth(obj) {
        let ind;
        for(let i in this._objects) {
            if(this._objects[i].id === obj.id) {
                ind = parseInt(i);
                break;
            }
        }

        let found_dir = (nz) => {
            if(nz < obj_z) return 1;
            if(nz > obj_z) return -1;
            return 0;
        };

        let obj_len = this._objects.length;
        let new_i = 1 + ind;
        let obj_z = obj.getPosition().z;
        let new_dir   = 1;
        let direction = 1;
        let dir_changes = 0;
        
        while((new_dir = found_dir(this._objects[new_i]?.getPosition().z)) !== 0 || new_i === ind) {
            if(new_dir !== direction) {
                dir_changes++;
                direction = new_dir;
            }
            
            new_i += (new_i+new_dir) == ind? 2*new_dir: new_dir;

            if(dir_changes >= 2 || new_i <= -1 || new_i >= obj_len) {
                break;
            }
        }
        
        if(new_i !== ind) {
            this._objects.splice(ind, 1);
            if(new_i >= ind) {
                new_i--;
            }
            if(new_i >= obj_len) {
                this._objects.push(obj);
            }
            else {
                if(new_i < 0) {
                    new_i = 0;
                }
                this._objects.splice(new_i, 0, obj);
            }
        }
    }

    _registerOrdenedByTag(obj) {
        for(let t in obj.tags) {
            if(obj.tags[t] in this._objects_by_tag) {
                this._objects_by_tag[obj.tags[t]].push(obj);
            }
            else {
                this._objects_by_tag[obj.tags[t]] = [obj];
            }
        }
    }

    _setTagRules(tags) {
        this._collision_tags = tags;

        for(let tag in tags) {
            if(tag in this._objects_by_tag) {
                let collideWith = this._objects.filter(obj => {
                    return obj.tags.some(otg => this._collision_tags[tag].includes(otg));
                });
                for(let obj in this._objects_by_tag[tag]) {
                    this._objects_by_tag[tag][obj]._objects_to_collide = collideWith.filter(cobj => {
                        return cobj.id != this._objects_by_tag[tag][obj].id;
                    });
                }
            }
        }
    }

    draw() {
        this.clearCanvas();

        for(let obj in this._objects) {
            this._objects[obj].frameUpdate();
            this.drawObject(this._objects[obj]);
        }
        if(this._draw_collisions) {
            for(let obj in this._objects) {
                this.drawObjectCollision(this._objects[obj]);
            }
        }
    }

    update() {
        for(let obj in this._objects) {
            this._objects[obj].update();
            this._objects[obj].updatePromises();
            this._objects[obj]._checkCollisions();
        }
    }

    clearCanvas() {
        if(this._context === null)
            return;
        
        let camSize = this.camera.getSize();
        this._context.clearRect(0, 0, camSize.width, camSize.height);
    }

    drawObject(obj) {
        let camPos = this.camera.getPosition();
        let objPos = obj.getPosition();
        let objSiz = obj.getSize();

        let xPos = objPos.x - camPos.x;
        let yPos = objPos.y - camPos.y;

        this.drawOnCanvas(obj.getTexture(), xPos, yPos, objSiz.width, objSiz.height, obj._debug_color);
    }

    drawObjectCollision(obj) {
        let camPos = this.camera.getPosition();
        let objPos = obj.getPosition();
        let cDots  = obj.getCollisionBox();

        let xPos = objPos.x - camPos.x;
        let yPos = objPos.y - camPos.y;

        this.drawPolyOnCanvas(cDots, xPos, yPos, this._collision_color);
    }

    drawOnCanvas(texture, x=0, y=0, width=16, height=16, d_color="#777") {
        if(this._canvas === null)
            return;

        if(texture.resource_location === "") {
            if(this._draw_debug) {
                this._context.fillStyle = d_color;
                this._context.fillRect(x, y, texture.width, texture.height);
            }
        }
        else {
            let img = texture.getImage();
            let framePos = texture.getFrame();
            this._context.drawImage(img,
                framePos.x, framePos.y, img.width, img.height,
                x, y, width, height
            );
        }
    }

    drawPolyOnCanvas(dots, x=0, y=0, color="#777") {
        if(dots.length) {
            this._context.beginPath();
            this._context.moveTo(x + dots[0].x, y + dots[0].y);
            for(let d=1; d < dots.length; d++) {
                this._context.lineTo(x + dots[d].x, y + dots[d].y);
            }
            this._context.lineTo(x + dots[0].x, y + dots[0].y);
    
            this._context.fillStyle = color;
            this._context.closePath();
            this._context.fill();
        }
    }
}


class Camera extends SceneObject {
    _target = null;
    _targetDistance = { 'x': 0, 'y': 0 };

    constructor() {
        let pageSize = Camera.getPageSize();
        super(0, 0, pageSize.width, pageSize.height);
    }

    static getPageSize() {
        return {
            'width' : document.body.offsetWidth,
            'height': document.body.offsetHeight
        };
    }

    setTarget(tgt) {
        this._target = tgt;
        this._calcTargetDistances();

        tgt.registerPromise("cameraUpdate", () => {
            this.centerOnTarget();
        });
    }

    centerOnTarget() {
        let tgtPos = this._target.getPosition();
        this.setPosition(tgtPos.x - this._targetDistance.x, tgtPos.y - this._targetDistance.y);
    }

    _calcTargetDistances() {
        this._targetDistance.x = this.getSize().width/2  - this._target.getSize().width/2;
        this._targetDistance.y = this.getSize().height/2 - this._target.getSize().height/2;
    }
}
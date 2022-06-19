class FinalLine extends Figure {
    constructor() {
        super("", 48, 200);
        this.tags = ["final"];
    }

    whenCollide(obj) {
        if(obj.tags.includes("player")) {
            obj.sendMessage(0);
        }
    }
}
import {TiledMeta} from "./TiledMeta";

export class TiledRoom {

    public width:number = 0;
    public height:number = 0;

    public layers:Array<Array<Array<number>>> = [];

    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    public setData(layers) {
        this.layers = layers;
    }

    public clear() {
        let prevLength = this.layers.length;
        this.layers.length = 0;
        this.initLayers(prevLength);
    }

    public initLayers(layerCount) {
        for (let i=0; i<layerCount; i++) {
            let layer = [];
            for (let y=0; y<this.height; y++) {
                let arr = [];
                for (let x=0; x<this.width; x++) {
                    arr.push(0);
                }
                layer.push(arr);
            }
            this.layers.push(layer);
        }
    }

    public generateFromMeta(meta:TiledMeta, bitflag) {

        this.clear();

        meta.drawToRoom(this,"floor");


        let i =0;


        //      top right down left
        //
        //      0 0 0 0     0 0 0 0
        //      walls       doors

        if ((bitflag & (1 << 0))) {
            meta.drawToRoom(this,"horizTop");
        }


        if ((bitflag & (1 << 1))) {
            meta.drawToRoom(this,"vertRight");
        }

        if ((bitflag & (1 << 2))) {
            meta.drawToRoom(this,"horizBottom");
        }

        if ((bitflag & (1 << 3))) {
            meta.drawToRoom(this,"vertLeft");
        }

        if (bitflag & 1 << 0 && bitflag & 1 << 1) {
            meta.drawToRoom(this,"innerCornerTopRight");
        }

        if (bitflag & 1 << 1 && bitflag & 1 << 2) {
            meta.drawToRoom(this,"innerCornerBottomRight");
        }

        if (bitflag & 1 << 2 && bitflag & 1 << 3) {
            meta.drawToRoom(this,"innerCornerBottomLeft");
        }

        if (bitflag & 1 << 3 && bitflag & 1 << 0) {
            meta.drawToRoom(this,"innerCornerTopLeft");
        }


        //OUTER CORNERS


        if (!(bitflag & 1 << 0) && !(bitflag & 1 << 1)) {
            console.log("top right");
            meta.drawToRoom(this,"outerCornerTopRight");
        }

        if (!(bitflag & 1 << 1) && !(bitflag & 1 << 2)) {
            console.log("bottom right");
            meta.drawToRoom(this,"outerCornerBottomRight");

        }

        if (!(bitflag & 1 << 2) && !(bitflag & 1 << 3)) {
            console.log("bottom left");
            meta.drawToRoom(this,"outerCornerBottomLeft");

        }

        if (!(bitflag & 1 << 3) && !(bitflag & 1 << 0)) {
            console.log("top left");
            meta.drawToRoom(this,"outerCornerTopLeft");

        }

    }


}
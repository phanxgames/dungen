import {TiledMap} from "./TiledMap";
const zlib = require('zlib');

export class TiledLayer {

    public map:TiledMap = null;

    public name:string = "";

    public data:Array<Array<number>> = [];


    constructor(map, name) {
        this.map = map;
        this.name = name;
        this.setSize(map.width, map.height);
    }

    public setSize(width, height) {
        this.data = [];
        for (let x=0; x<width; x++) {
            let arr = [];
            for (let y=0; y<height; y++) {
                arr.push(0);
            }
            this.data.push(arr);
        }
    }


    public encodeData() {

        let data = [];
        for (let x=0; x<this.map.width; x++) {
            for (let y=0; y<this.map.height; y++) {
                data.push(this.data[x][y]);
            }
        }

        let arr = new Uint32Array(data);
        let buf = new Buffer(arr.buffer);

        return zlib.deflateSync(buf).toString('base64');
    }



}

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

}
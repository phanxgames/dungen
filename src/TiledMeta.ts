import {UtilFiles} from "./UtilFiles";
import {TiledLayer} from "./TiledLayer";
import {TiledRoom} from "./TiledRoom";



export class TiledMeta {

    public tilesets:Array<any> = [];

    public metaMapWidth:number = 0;
    public innerHSplit:number = 0;
    public innerVSplit:number = 0;

    public data:TiledMetaData = {
        floor: null,
        horizTop: null,
        horizBottom: null,
        vertLeft: null,
        vertRight: null,
        innerCornerTopLeft: null,
        innerCornerTopRight: null,
        innerCornerBottomLeft: null,
        innerCornerBottomRight: null,
        outerCornerTopLeft: null,
        outerCornerTopRight: null,
        outerCornerBottomLeft: null,
        outerCornerBottomRight: null
    };

    constructor() {
    }

    async load(path) {

        let data = await UtilFiles.loadTmx(path);

        this.metaMapWidth = data.width;

        this.innerHSplit = data.properties["innerHSplit"];
        this.innerVSplit = data.properties["innerVSplit"];

        this.tilesets = data.tilesets;

        //floor
        this.data["floor"] = {
            layers:[],
            x:0,
            y:0,
            width:10
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=0; y<10; y++) {
                for (let x=0; x<10; x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["floor"].layers.push(dataLayer);
        }

        //horizTop
        this.data["horizTop"] = {
            layers:[],
            x:0,
            y:0,
            width:10
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=0; y<6; y++) {
                for (let x=10; x<20; x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["horizTop"].layers.push(dataLayer);
        }

        //horizBottom
        this.data["horizBottom"] = {
            layers:[],
            x:0,
            y:6,
            width:10
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=6; y<10; y++) {
                for (let x=10; x<20; x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["horizBottom"].layers.push(dataLayer);
        }

        //vertTop
        this.data["vertLeft"] = {
            layers:[],
            x:0,
            y:0,
            width:5
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=0; y<10; y++) {
                for (let x=20; x<25; x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["vertLeft"].layers.push(dataLayer);
        }

        //vertBottom
        this.data["vertRight"] = {
            layers:[],
            x:5,
            y:0,
            width:5
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=0; y<10; y++) {
                for (let x=25; x<30; x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["vertRight"].layers.push(dataLayer);
        }

        //innerCornerTopLeft
        this.data["innerCornerTopLeft"] = {
            layers:[],
            x:0,
            y:0,
            width:this.innerHSplit
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=0; y<this.innerVSplit; y++) {
                for (let x=30; x<(30+this.innerHSplit); x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["innerCornerTopLeft"].layers.push(dataLayer);
        }

        //innerCornerTopRight
        this.data["innerCornerTopRight"] = {
            layers:[],
            x:this.innerHSplit,
            y:0,
            width:10-this.innerHSplit
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=0; y<this.innerVSplit; y++) {
                for (let x=(30+this.innerHSplit); x<40; x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["innerCornerTopRight"].layers.push(dataLayer);
        }

        //innerCornerBottomLeft
        this.data["innerCornerBottomLeft"] = {
            layers:[],
            x:0,
            y:this.innerVSplit,
            width:this.innerHSplit
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=this.innerVSplit; y<10; y++) {
                for (let x=30; x<(30+this.innerHSplit); x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["innerCornerBottomLeft"].layers.push(dataLayer);
        }

        //innerCornerBottomRight
        this.data["innerCornerBottomRight"] = {
            layers:[],
            x:this.innerHSplit,
            y:this.innerVSplit,
            width:10-this.innerHSplit
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=this.innerVSplit; y<10; y++) {
                for (let x=(30+this.innerHSplit); x<40; x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["innerCornerBottomRight"].layers.push(dataLayer);
        }

        //outerCornerTopLeft
        this.data["outerCornerTopLeft"] = {
            layers:[],
            x:0,
            y:0,
            width:5
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=0; y<5; y++) {
                for (let x=40; x<45; x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["outerCornerTopLeft"].layers.push(dataLayer);
        }

        //outerCornerTopRight
        this.data["outerCornerTopRight"] = {
            layers:[],
            x:5,
            y:0,
            width:5
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=0; y<7; y++) {
                for (let x=45; x<50; x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["outerCornerTopRight"].layers.push(dataLayer);
        }

        //outerCornerBottomLeft
        this.data["outerCornerBottomLeft"] = {
            layers:[],
            x:0,
            y:7,
            width:5
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=7; y<10; y++) {
                for (let x=40; x<45; x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["outerCornerBottomLeft"].layers.push(dataLayer);
        }

        //outerCornerBottomRight
        this.data["outerCornerBottomRight"] = {
            layers:[],
            x:5,
            y:7,
            width:5
        };
        for (let layer of data.layers) {
            let dataLayer = [];
            for (let y=7; y<10; y++) {
                for (let x=45; x<50; x++) {
                    dataLayer.push(layer.tiles[x+this.metaMapWidth*y]?.id||-1);
                }
            }
            this.data["outerCornerBottomRight"].layers.push(dataLayer);
        }


    }

    public drawToRoom(room:TiledRoom, segment:string) {

        let data = this.data[segment];

        for (let l=0; l<room.layers.length; l++) {

            let dataLayer = data.layers[l];

            for (let i=0; i<dataLayer.length; i++) {
                let val = dataLayer[i];
                if (val == -1) continue;
                let x = data.x + Math.floor(i % data.width);
                let y = data.y + Math.floor(i / data.width);
                room.layers[l][y][x] = val;
            }

        }

    }



}

export interface TiledMetaData {
    floor: TiledMetaDataSegment,
    horizTop: TiledMetaDataSegment,
    horizBottom: TiledMetaDataSegment,
    vertLeft: TiledMetaDataSegment,
    vertRight: TiledMetaDataSegment,
    innerCornerTopLeft: TiledMetaDataSegment,
    innerCornerTopRight: TiledMetaDataSegment,
    innerCornerBottomLeft: TiledMetaDataSegment,
    innerCornerBottomRight: TiledMetaDataSegment,
    outerCornerTopLeft: TiledMetaDataSegment,
    outerCornerTopRight: TiledMetaDataSegment,
    outerCornerBottomLeft: TiledMetaDataSegment,
    outerCornerBottomRight: TiledMetaDataSegment
}

export interface TiledMetaDataSegment {
    layers:Array<any>,
    x:number,
    y:number,
    width:number
}
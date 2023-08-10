import {UtilFiles} from "./UtilFiles";
import {Util} from "./Util";
import {TiledLayer} from "./TiledLayer";
import {TiledRoom} from "./TiledRoom";


export class TiledMap {

    public width:number = 0;
    public height:number = 0;

    public layers:Array<TiledLayer> = [];

    constructor( width=30, height=30, layerCount=4) {

        for (let i=0; i<layerCount; i++) {
            this.layers.push(new TiledLayer(this, "Tiled Layer " + (i+1)));
        }

        this.setSize(width,height);
    }

    public setSize(width, height) {
        this.width = width;
        this.height = height;
        for (let layer of this.layers) {
            layer.setSize(width, height);
        }
    }

    public addRoom(room:TiledRoom, roomX, roomY) {

        let i=0;
        for (let roomLayer of room.layers) {
            let mapLayer = this.layers[i];

            for (let x=0; x<room.width; x++) {
                for (let y=0; y<room.height; y++) {
                    mapLayer.data[roomY+x][roomX+y] = roomLayer[x][y];
                }
            }

            i++;
        }


    }



    async save() {

        let width = this.width;
        let height = this.height;

        let data = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.5" tiledversion="1.7.1" orientation="orthogonal" renderorder="right-down" width="${width}" height="${height}" tilewidth="16" tileheight="16" infinite="0" nextlayerid="${this.layers.length}" nextobjectid="1">
\n`;

        data += `  <tileset firstgid="1" source="system.tsx"/>
                     <tileset firstgid="1711" source="domhan_floors.tsx"/>
                     <tileset firstgid="2515" source="domhan_forest.tsx"/>
                     <tileset firstgid="3199" source="domhan_forest_doodads.tsx"/>\n`;

        let i=0;
        for (let layer of this.layers) {
            data += `
    <layer id="${i}" name="${layer.name}" width="${width}" height="${height}" locked="1">
    <data encoding="base64" compression="zlib">${layer.encodeData()}</data>
    </layer>\n`;
            i++;
        }
    
        data += `
</map>`;


        UtilFiles.saveFile('../out/test.tmx', data);


    }
}
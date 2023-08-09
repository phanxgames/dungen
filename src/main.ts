//
import {GenMap} from "./GenMap";
import {TiledMap} from "./TiledMap";
import {TiledRoom} from "./TiledRoom";

console.log("Welcome to: Phanxgames Dungen");
console.log("--------------------------------------------------");

let map = new GenMap(10,10);

(()=>{
    let count = 0;
    while(true) {
        count++;
        if(count > 10)
        {
            console.log("Dungeon generation took too many attempts. Aborting.");
            return;
        }
        try {
            //map.generateCells1();

            //console.log("Generated within " + count + " attempts!");
            //map.drawMap();
            //map.drawMap(true);


            let room = new TiledRoom(5, 5);
            room.setData([
                [
                    [1,1,1,1,1],
                    [1,2,2,2,1],
                    [1,2,2,2,1],
                    [1,2,2,2,1],
                    [1,1,1,1,1]
                ],
                [
                    [0,0,0,0,0],
                    [0,0,0,0,0],
                    [0,0,16,0,0],
                    [0,0,0,0,0],
                    [0,0,0,0,0]
                ]
            ]);
            let tmx = new TiledMap(30, 30, 4);
            tmx.addRoom(room, 1, 1);
            tmx.addRoom(room, 6, 11);
            tmx.addRoom(room, 11, 1);
            tmx.addRoom(room, 15, 11);
            tmx.save();

            return;
        } catch (e) {
            console.error(e);
            console.log("Re-attempting generation...");
        }

    }
})();


// (()=>{
//     let count = 0;
//     let pass = 0;
//     let fail = 0;
//     for(let i=0; i<1000; i++) {
//         try {
//             map.generateCells1();
//             //console.log("Generated within " + count + " attempts...");
//             //map.drawMap();
//             pass++;
//         } catch (e) {
//             fail++;
//             //console.error(e);
//         }
//
//     }
//
//     console.log("Pass: " + pass);
//     console.log("Fail: " + fail);
//
// })();
console.log("");
console.log("");
console.log("");
console.log("");
console.log("--------------------------------------------------");
console.log("--------------------------------------------------");


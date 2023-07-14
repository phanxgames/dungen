//
import {GenMap} from "./GenMap";

console.log("Welcome to: Phanxgames Dungen");
console.log("--------------------------------------------------");

let map = new GenMap(6,6);

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
            map.generateCells1();

            console.log("Generated within " + count + " attempts!");
            map.drawMap();
            map.drawMap(true);
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


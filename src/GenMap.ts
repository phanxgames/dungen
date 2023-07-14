import {GenCell} from "./GenCell";
import {Util} from "./Util";

const SHOW_FAILED_MAPS:boolean = true;
const SHOW_SIMULATION:boolean = true;

export const UP = 1;
export const RIGHT = 2;
export const DOWN = 4;
export const LEFT = 8;

export const ENCODING = {
    0: " ",
    1: "╹", //UP
    2: "╺", //RIGHT
    3: "┗", //UP,RIGHT
    4: "╻", //DOWN
    5: "┃", //UP,DOWN
    6: "┏", //RIGHT,DOWN
    7: "┣", //UP,RIGHT,DOWN
    8: "╸", //LEFT
    9: "┛", //LEFT,UP
    10: "━", //LEFT,RIGHT
    11: "┻", //LEFT,RIGHT,UP
    12: "┓", //LEFT,DOWN
    13: "┫", //LEFT,DOWN,UP
    14: "┳", //LEFT,DOWN,RIGHT
    15: "╋", //UP,RIGHT,DOWN,LEFT
}


export class GenMap {

    public widthInCells:number = 3;
    public heightInCells:number = 3;
    public numBosses:number = 3;
    public maxRooms:number = 100;
    public maxGiantRooms:number = 3;
    public maxChests:number = 100;
    public maxLockedDoors:number = 3;
    public maxMonsterChokes:number = 3;
    

    public cells:Array<Array<GenCell>> = [];
    public listCells:Array<GenCell> = [];
    public cellStart:GenCell = null;
    public cellBosses:Array<GenCell> = [];


    constructor(widthInCells:number=10, heightInCells:number=10) {
        this.widthInCells = Math.max(5, widthInCells);
        this.heightInCells = Math.max(5, heightInCells);
    }



    private _setupCells():void {
        this.cells = [];

        for (let x=0; x<this.widthInCells; x++) {
            let arr = [];
            for (let y=0; y<this.heightInCells; y++) {
                arr[y] = new GenCell(this,"X");
            }
            this.cells.push(arr);
        }
    }

    public generateCells1():void {
        this._setupCells();

        let x:number = 0;
        let y:number = 0;
        let cell:GenCell = null;
        let mapPaddingX:number = Math.ceil(this.widthInCells*0.2);
        let arr = null;
        this.listCells = [];
        let listEmptyCells = new Set<GenCell>();
        let cellBoss = null;


        //populate cells as a list instead of 2d array
        for (let x=0; x<this.widthInCells; x++) {
            for (let y=0; y<this.heightInCells; y++) {
                cell = this.cells[x][y];
                cell.x = x;
                cell.y = y;
                this.listCells.push(cell);
                listEmptyCells.add(cell);
            }
        }

        //connect graph nodes
        for (cell of this.listCells)
        {
            if (cell.y-1 >= 0)
                cell.cellUp = this.cells[cell.x][cell.y-1];
            if (cell.x+1 < this.widthInCells)
                cell.cellRight = this.cells[cell.x+1][cell.y];
            if (cell.y+1 < this.heightInCells)
                cell.cellDown = this.cells[cell.x][cell.y+1];
            if (cell.x-1 >= 0)
                cell.cellLeft = this.cells[cell.x-1][cell.y];
        }


        //place starting cell
        x = Util.randomInt(mapPaddingX, this.widthInCells-1-mapPaddingX);
        y = this.heightInCells-1;
        this.cellStart = this.cells[x][y];
        this.cellStart.value = "S";
        listEmptyCells.delete(this.cells[x][y]);



        //place boss cell
        let minDistanceFromStart = Math.max(3, this.widthInCells*0.5);
        let minDistanceFromAnotherBoss = Math.floor(Math.max(2, this.widthInCells/this.numBosses)-1);
        let bossCount = 0;
        let bossContinue = false;
        while (true) {
            x = Util.randomInt(0, this.widthInCells-1);
            y = Util.randomInt(0, this.heightInCells-1);
            cell = this.cells[x][y];
            if (cell==null) continue;

            if (
                Math.abs(this.cellStart.x-x)+Math.abs(this.cellStart.y-y) < minDistanceFromStart
            )
                continue;

            for (let otherBoss of this.cellBosses)
            {
                if (
                    Math.abs(otherBoss.x-x)+Math.abs(otherBoss.y-y) < minDistanceFromAnotherBoss
                ) {
                    bossContinue = true;
                    break;
                }
            }

            if (bossContinue) {
                bossContinue = false;
                continue;
            }

            if (cell.isEmpty() && cell.cellDown!=null && cell.cellDown.isEmpty())
            {
                cell.value = "B";
                cellBoss = cell;
                listEmptyCells.delete(cell);

                cellBoss.cellDown.value = "R";
                cellBoss.cellDown.bossPreCell = true;
                listEmptyCells.delete(cellBoss.cellDown);
                bossCount++;

                this.cellBosses.push(cell);

                if (bossCount >= this.numBosses)
                    break;
            }
        }





        //place random rooms
        let numRooms = 0;
        this.maxRooms = Math.floor(Math.min(this.maxRooms, this.listCells.length*0.2));
        arr = Util.shuffleSetToArray(listEmptyCells);
        for (let i=0; i<arr.length; i++) {
            cell = arr[i];
            if (cell!=null && cell.value == "X") {
                cell.value = "R";
                numRooms++;
                listEmptyCells.delete(cell);
                arr[i] = null;
                if (numRooms >= this.maxRooms) break;
            }
        }

        //place random giant rooms
        let numGiantRooms = 0;
        this.maxGiantRooms = Math.ceil(Math.min(this.maxGiantRooms, this.listCells.length*0.1));
        arr = Util.shuffleArray(this.listCells);
        for (cell of arr) {
            if (cell!=null && cell.value == "R") {


                let changeRooms = [];

                //top right
                if (
                    cell.cellRight!=null && (cell.cellRight.isRoom() || cell.cellRight.isEmpty()) &&
                    cell.cellUp!=null && (cell.cellUp.isRoom() || cell.cellUp.isEmpty()) &&
                    cell.cellUp.cellRight!=null && (cell.cellUp.cellRight.isRoom() || cell.cellUp.cellRight.isEmpty())
                ) {
                    changeRooms.push(cell.cellRight);
                    changeRooms.push(cell.cellUp);
                    changeRooms.push(cell.cellUp.cellRight);
                }

                //top left
                if (
                    cell.cellUp!=null && (cell.cellUp.isRoom() || cell.cellUp.isEmpty()) &&
                    cell.cellLeft!=null && (cell.cellLeft.isRoom() || cell.cellLeft.isEmpty()) &&
                    cell.cellUp.cellLeft!=null && (cell.cellUp.cellLeft.isRoom() || cell.cellUp.cellLeft.isEmpty())
                )
                {
                    changeRooms.push(cell.cellLeft);
                    changeRooms.push(cell.cellUp);
                    changeRooms.push(cell.cellUp.cellLeft);
                }

                //bottom left
                if (
                    cell.cellDown!=null && (cell.cellDown.isRoom() || cell.cellDown.isEmpty()) &&
                    cell.cellDown.cellLeft!=null && (cell.cellDown.cellLeft.isRoom() || cell.cellDown.cellLeft.isEmpty()) &&
                    cell.cellLeft!=null && (cell.cellLeft.isRoom() || cell.cellLeft.isEmpty())
                ){
                    changeRooms.push(cell.cellLeft);
                    changeRooms.push(cell.cellDown);
                    changeRooms.push(cell.cellDown.cellLeft);
                }

                //bottom right
                if (
                    cell.cellDown!=null && (cell.cellDown.isRoom() || cell.cellDown.isEmpty()) &&
                    cell.cellRight!=null && (cell.cellRight.isRoom() || cell.cellRight.isEmpty()) &&
                    cell.cellDown.cellRight!=null && (cell.cellDown.cellRight.isRoom() || cell.cellDown.cellRight.isEmpty())
                ) {
                    changeRooms.push(cell.cellDown);
                    changeRooms.push(cell.cellRight);
                    changeRooms.push(cell.cellDown.cellRight);
                }

                if (changeRooms.length > 0) {
                    numGiantRooms++;
                }

                for (let changeCell of changeRooms)
                {
                    changeCell.value = "R";
                    listEmptyCells.delete(changeCell);
                }
                if (numGiantRooms >= this.maxGiantRooms) {
                    break;
                }


            }
        }




        //place hallways where needed
        //  find rooms that aren't touching
        //this._generateHall1(this.cellStart);

        // Generate Hallways
        // for (let cell of this.listCells) {
        //     if (cell == null || cell.visited) continue;
        //     if (!cell.isRoom()) continue;
        //
        //
        //     //find another cell on same axis , randomly x or y axis
        //     let max = 0;
        //     let prop = "x";
        //     let x = 0;
        //     let y = 0;
        //     if (Util.randomInt(0, 1) == 1) {
        //         x = cell.x;
        //         y = -1;
        //         max = this.heightInCells;
        //         prop = "y";
        //     } else {
        //         x = -1;
        //         y = cell.y;
        //         max = this.widthInCells;
        //         prop = "x";
        //     }
        //     //console.log(prop, x, y, max);
        //
        //     let rCell: GenCell = null;
        //     for (let i = 0; i < max; i++) {
        //         rCell = this.cells[x == -1 ? i : x][y == -1 ? i : y];
        //         //console.log(rCell.x,rCell.y, rCell.value);
        //         if (rCell != null && rCell.isRoom() && rCell != cell) {
        //             break;
        //         }
        //         rCell = null;
        //     }
        //
        //     //rCell is another unvisited room
        //     if (rCell != null) {
        //
        //         cell.visited = true;
        //         rCell.visited = true;
        //         let min = Math.min(rCell[prop], cell[prop]);
        //         let max = Math.max(rCell[prop], cell[prop]);
        //         //console.log(min,max);
        //         for (let i = min; i < max; i++) {
        //             rCell = this.cells[x == -1 ? i : x][y == -1 ? i : y];
        //             if (rCell != null && rCell.isEmpty()) {
        //                 rCell.value = "H";
        //                 rCell.visited = true;
        //             }
        //         }
        //
        //
        //     }
        //
        // }



        //find the islands
        //connect them or delete them
        // findNearestCellThatIsOnTheTrunk



        //console.log("init map");
        //this.drawMap();


        //find unvisited rooms
        arr = Util.shuffleArray(this.listCells);
        for (cell of arr) {
            if (cell == null || !cell.isRoom() || cell.visited) continue;

            //find nearest hallway
            let path = Util.findNearestReachableCellAndPath(this.cells, [cell.x, cell.y], "H");
            //console.log("path", path);

            if (path==null) {
                path = Util.findNearestReachableCellAndPath(this.cells, [cell.x, cell.y], "R");
            }

            if (path!=null) {
                for (let pathItem of path) {
                    let foundCell = this.cells[pathItem[0]][pathItem[1]];
                    if (foundCell != null && foundCell.isEmpty()) {
                        foundCell.value = "H";
                        foundCell.visited = true;
                    }
                }

                cell.visited = true;
                //cell.value = "R";
            }

        }

        //console.log("unvisited rooms");
        //this.drawMap();

        //make sure all rooms are connected to START
        let result = Util.hasUnreachableCells(this.cells, "S",  "R","SRH");
        if (result!==false) {
            for (let item of result) {
                cell = this.cells[item[0]][item[1]];
                if (cell != null) {
                    // cell.value = "X";

                    let path = Util.findNearestReachableCellAndPath(this.cells, [cell.x, cell.y], "R");
                    if (path != null) {
                        for (let pathItem of path) {
                            let foundCell = this.cells[pathItem[0]][pathItem[1]];
                            if (foundCell != null && foundCell.isEmpty()) {
                                foundCell.value = "H";
                                foundCell.visited = true;
                            }
                        }
                    }

                }
            }

            //console.log("pass 1");
            //this.drawMap();

            //pass 2: add random rooms until things are connected
            let pass2Happened = false;
            for (let i=0; i<this.widthInCells*this.heightInCells; i++) {
                result = Util.hasUnreachableCells(this.cells, "S", "R", "SRH");
                if (result !== false) {
                    pass2Happened = true;
                    //console.log(result);
                    for (let item of result) {
                        cell = this.cells[item[0]][item[1]];
                        if (cell != null) {

                            for (x = Math.max(0,cell.x-1); x < Math.min(this.widthInCells, cell.x+1); x++) {
                                for (y = Math.max(0, cell.y-1); y < Math.min(this.heightInCells, cell.y+1); y++) {
                                    let rCell = this.cells[x][y];
                                    if (rCell == cell) continue;
                                    if (rCell.isEmpty() && Util.randomInt(0, 99) < 50) {
                                        rCell.value = "H";
                                        rCell.visited = true;
                                    }
                                }
                            }

                        }
                    }

                } else {
                    break;
                }
            }

            if (pass2Happened) {
                //console.log("pass 2");
                //this.drawMap();

                //pass 3: delete unreachable cells left
                result = Util.hasUnreachableCells(this.cells, "S", "RHB", "SRH");
                if (result !== false) {
                    //console.log(result);
                    for (let item of result) {
                        cell = this.cells[item[0]][item[1]];
                        if (cell != null) {
                            cell.value = "X";
                            cell.visited = false;
                        }
                    }

                    //console.log("pass 3");
                    //this.drawMap();
                }
            }
        }



        //find lonely rooms
        for (cell of this.listCells)
        {
            if (cell==null || !cell.isRoom()) continue;
            if ( (cell.cellUp==null || cell.cellUp.isEmpty())
                &&
                (cell.cellRight==null || cell.cellRight.isEmpty())
                &&
                (cell.cellDown==null || cell.cellDown.isEmpty())
                &&
                (cell.cellLeft==null || cell.cellLeft.isEmpty())
            ) {

                if (SHOW_FAILED_MAPS) {
                    this.drawMap();
                    console.log("ERROR! Lonely room found: " + cell.x + "," + cell.y);
                    console.log("--------------------------------------------------");
                    console.log("Regenerating map...");
                    console.log("--------------------------------------------------");
                }
                throw new Error("Lonely room found: " + cell.x + "," + cell.y);
                return;
            }
        }

        //check if boss still exists
        let found = false;
        for (cell of this.listCells)
        {
            if (cell.isBoss()) found = true;
        }
        if (!found) {
            throw new Error("Boss room not found");
            return;
        }


        // remove thicc cluster density mega rooms
        //  example:
        //      r r r       r r r
        //      r r r   =>  r   r
        //      r r r       r r r

        let arrBadClusterRooms = [];
        for (x = 1; x < this.widthInCells-1; x++) {
            for (y = 1; y < this.heightInCells-1; y++) {
                cell = this.cells[x][y];
                if (cell==null) continue;

                if (
                    cell.cellRight!=null && (cell.cellRight.isRoom() || cell.cellRight.isHallway()) &&
                    cell.cellLeft!=null && (cell.cellLeft.isRoom() || cell.cellLeft.isHallway()) &&
                    cell.cellUp!=null && (cell.cellUp.isRoom() || cell.cellUp.isHallway()) &&
                    cell.cellDown!=null && (cell.cellDown.isRoom() || cell.cellDown.isHallway()) &&
                    cell.cellUp.cellLeft!=null && (cell.cellUp.cellLeft.isRoom() || cell.cellUp.cellLeft.isHallway()) &&
                    cell.cellUp.cellRight!=null && (cell.cellUp.cellRight.isRoom() || cell.cellUp.cellRight.isHallway()) &&
                    cell.cellDown.cellLeft!=null && (cell.cellDown.cellLeft.isRoom() || cell.cellDown.cellLeft.isHallway()) &&
                    cell.cellDown.cellRight!=null && (cell.cellDown.cellRight.isRoom() || cell.cellDown.cellRight.isHallway())
                ) {
                    arrBadClusterRooms.push(cell);
                }
            }
        }
        for (cell of arrBadClusterRooms) {
            cell.value = "X";
            cell.visited = false;
        }




        //place them within the area before the locked door
        //  gives you a trunk that doesnt go past the locked door
        
        //make a deadend if you cant find one for keys

        //tally up deadends
        let arrDeadends = [];
        for (let cell of arr)
        {
            if (cell!=null &&
                ((cell.isRoom() && cell.isRoomWithNoObject()) || cell.isHallway())
                && cell.isDeadEnd()
                &&
                ((Math.abs(cell.x-this.cellStart.x)+Math.abs(cell.y-this.cellStart.y)) >
                    Math.ceil(this.widthInCells/3))
            )
            {
                arrDeadends.push(cell);
            }
        }

        //place chests
        arr = Util.shuffleArray(arrDeadends);
        let chestCount = 0;
        this.maxChests = Math.ceil(Math.min(this.maxChests, arrDeadends.length));
        for (let cell of arr)
        {
            if (chestCount > this.maxChests) break;
            if (cell!=null)
            {
                cell.value = "C";
                chestCount++;
            }
        }


        //  start from the start
        // for each room
        //      find a room to place a locked door
        //          scan whats before that locked door, and place the key




        //place monster chokes
        let numMonsterChokes = 0;
        arr = Util.shuffleArray(this.listCells);
        //can only be hallways touching other hallways
        for (let cell of arr)
        {
            if (cell!=null && cell.isHallway() && cell.isCorridorLike())
            {
                cell.value = "M";
                numMonsterChokes++;
                if (numMonsterChokes >= this.maxMonsterChokes) break;
            }
        }


        let keyCount = 0;
        let lockCount = 0;


        // add key near start room
        // let bonusKeyOptions = [];
        // for (x = Math.max(0, this.cellStart.x-1); x < Math.min(this.widthInCells, this.cellStart.x+2); x++) {
        //     for (y = Math.max(0, this.cellStart.y-1); y < Math.min(this.heightInCells, this.cellStart.y+2); y++) {
        //         let rCell = this.cells[x][y];
        //         if (rCell == this.cellStart) continue;
        //         if (rCell.isEmpty() ) {
        //             bonusKeyOptions.push(rCell);
        //         }
        //     }
        // }
        // let rCell = Util.randomArrayItem(bonusKeyOptions);
        // if (rCell!=null) {
        //     rCell.value = "K";
        //     rCell.visited = true;
        //     keyCount++;
        // }


        //place locked doors
        // arr = Util.shuffleArray(this.listCells);
        // //can only be hallways touching other hallways
        // for (let cell of arr)
        // {
        //     if (cell!=null && cell.isHallway() && cell.isCorridorLike())
        //     {
        //         cell.value = "L";
        //         lockCount++;
        //         if (lockCount >= this.maxLockedDoors) break;
        //     }
        // }

        //place keys
        arr = Util.shuffleArray(this.listCells);
        for (let cell of arr)
        {
            if (keyCount == (lockCount-1)) break;
            if (cell!=null && cell.isRoom() && cell.isRoomWithNoObject() && cell.isNotBossPreRoom() )
            {
                cell.value = "K";
                keyCount++;
                if (keyCount >= bossCount) break;
            }
        }

        //remove extra keys
        // while (keyCount > lockCount) {
        //     arr = Util.shuffleArray(this.listCells);
        //     for (let cell of arr)
        //     {
        //         if (cell!=null && cell.value=="K") {
        //             cell.value = "R";
        //             keyCount--;
        //             break;
        //         }
        //     }
        // }


        //remove extra doors
        // while (lockCount > keyCount) {
        //     arr = Util.shuffleArray(this.listCells);
        //     for (let cell of arr)
        //     {
        //         if (cell!=null && cell.value=="L") {
        //             cell.value = "H";
        //             lockCount--;
        //             break;
        //         }
        //     }
        // }




        // //simulate if the keys and doors are good
        // let [simResult,simLog] = this._simulateKeysAndLocks();
        // if (SHOW_SIMULATION)
        //     console.log(simLog.join("\n"));
        // if (!simResult) {
        //     this.drawMap();
        //     console.log("ERROR! Unable to simulate Locks and Keys successfully.");
        //     console.log("--------------------------------------------------");
        //     console.log("Regenerating map...");
        //     console.log("--------------------------------------------------");
        //     throw new Error("Unable to simulate Locks and Keys successfully.");
        //
        // }


        //add wall bitflags
        for (cell of this.listCells) {
            if (cell==null || cell.isEmpty()) continue;

            let up = cell.cellUp!=null && !cell.cellUp.isEmpty() ;
            let right = cell.cellRight!=null && !cell.cellRight.isEmpty() && !cell.cellRight.isBoss();
            let down = cell.cellDown!=null && !cell.cellDown.isEmpty() && !cell.cellDown.isBoss();
            let left = cell.cellLeft!=null && !cell.cellLeft.isEmpty() && !cell.cellLeft.isBoss();


            if (cell.isBoss()) {
                up = false;
                right = false;
                left = false;
            }
            if (cell.value=="S") {
                down = true;
            }

            cell.setWalls(up, right, down, left);

        }

        // //find and mark joined rooms
        // for (cell of this.listCells) {
        //     if (cell==null || cell.value!="R") continue;
        //
        //     if (cell.cellUp!=null && cell.cellUp.value=="R") {
        //         cell.cellUp.joinedRoom = true;
        //         cell.joinedRoom = true;
        //     }
        //
        //     if (cell.cellRight!=null && cell.cellRight.value=="R") {
        //         cell.cellRight.joinedRoom = true;
        //         cell.joinedRoom = true;
        //     }
        //
        //     if (cell.cellLeft!=null && cell.cellLeft.value=="R") {
        //         cell.cellLeft.joinedRoom = true;
        //         cell.joinedRoom = true;
        //     }
        //
        //     if (cell.cellDown!=null && cell.cellDown.value=="R") {
        //         cell.cellDown.joinedRoom = true;
        //         cell.joinedRoom = true;
        //     }
        //
        // }



        let endRoomCount = 0;
        let endChestCount = 0;
        let endHallCount = 0;
        let endMonsterCount = 0;
        let endBossCount = 0;
        let endBossKeyCount = 0;
        for (cell of this.listCells)
        {
            if (cell==null) continue;
            if (cell.value=="R") endRoomCount++;
            if (cell.value=="C") endChestCount++;
            if (cell.value=="H") endHallCount++;
            if (cell.value=="M") endMonsterCount++;
            if (cell.value=="B") endBossCount++;
            if (cell.value=="K") endBossKeyCount++;
        }

        if (endBossCount!=endBossKeyCount) {
            throw new Error("Boss Count do not match Boss Key Count");
        }


        console.log("{S} Start here")
        console.log("[R] Room Count: " + endRoomCount);
        console.log("{B} Boss Count: " + endBossCount);
        console.log("[K] Boss Key Count: " + endBossKeyCount);
        console.log("[C] Chest Count: " + endChestCount);
        console.log("[-] Hall Count: " + endHallCount);
        console.log("[M] Monster Chokes Count: " + endMonsterCount);

    }

    private _generateHall1(cell:GenCell):void {

        if (cell==null) return;
        cell.visited = true;

        if (cell.isEmpty()) {
            cell.value = "H";
            //listEmptyCells.delete(cell);
        }

        cell.value = cell.value.toLowerCase();


        let arrNeighbors = [];
        if (cell.cellLeft != null && !cell.cellLeft.visited)
            arrNeighbors.push(cell.cellLeft);

        if (cell.cellRight != null && !cell.cellRight.visited)
            arrNeighbors.push(cell.cellRight);

        if (cell.cellUp != null && !cell.cellUp.visited)
            arrNeighbors.push(cell.cellUp);

        if (cell.cellDown != null && !cell.cellDown.visited)
            arrNeighbors.push(cell.cellDown);

        let rCell = Util.randomArrayItem(arrNeighbors);
        this._generateHall1(rCell);

    }
    
    
    private _simulateKeysAndLocks():[boolean, Array<string>]
    {
        let log = [];
        let totalKeys = 0;
        let totalLockedDoors = 0;
        for (let cell of this.listCells)
        {
            if (cell!=null && cell.isLockedDoor()) totalLockedDoors++;
            if (cell!=null && cell.isRoomWithKey()) totalKeys++;
        }

        if (totalKeys<totalLockedDoors) {
            log.push("There is not enough keys to unlock all the locked doors. Aborting simulation.");
            return [false,log];
        }
        
        let cell = this.cellStart;
        let keys = 0;
        let cellsTraveled = 0;
        let keyLog = [];
        let lockLog = [];
        let bossFound = false;
        while (true) {


            cellsTraveled++;

            if (cellsTraveled > 1000000) {
                log.push("You seem to be lost. Aborting simulation.");
                return [false,log];
            }

            let options = [];
            if (cell.cellUp!=null) options.push(cell.cellUp);
            if (cell.cellRight!=null) options.push(cell.cellRight);
            if (cell.cellDown!=null) options.push(cell.cellDown);
            if (cell.cellDown!=null) options.push(cell.cellDown);

            let option:GenCell;
            for (option of options)
            {
                if (option.isBoss() && !bossFound) {
                    log.push("Found the boss by travelling across " + cellsTraveled + " cells.");
                    bossFound = true;
                    if (totalLockedDoors==0)
                        return [true,log];
                    continue;
                }
                if (option.isEmpty()) continue;
                if (option.isLockedDoor() && lockLog.indexOf(option)===-1 && keys==0) continue;
                if (option.isLockedDoor() && lockLog.indexOf(option) >= 0 && keys>0) {
                    keys--;
                    lockLog.push(option);
                    log.push("You unlocked a door with a key. You now have " + keys + " keys.");

                    if (lockLog.length >= totalLockedDoors) {
                        log.push("You unlocked all the doors. You won!");
                        return [true, log];
                    }
                }
                if (option.isRoomWithKey() && keyLog.indexOf(option)===-1) {
                    keys++;
                    log.push("You found a key. You now have " + keys + " keys.");
                    keyLog.push(option);
                }

                cell = option;
                break;
            }

            if (options.length==0) {
                log.push("Found a path with no options. Aborting dungeon.");
                return [false,log];

            }


        }


        
    }


    public drawMap(encoded:boolean=false):void {
        let str = "--------------------------------------------------\n";
        for (let y=0; y<this.heightInCells; y++) {
            for (let x=0; x<this.widthInCells; x++) {
                str += this.cells[x][y].toString(encoded);
            }
            str += "\n";
        }
        console.log(str);
    }
}
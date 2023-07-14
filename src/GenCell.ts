import {DOWN, ENCODING, GenMap, LEFT, RIGHT, UP} from "./GenMap";

export class GenCell {

    public map:GenMap;
    public value:string = "";

    public x:number = 0;
    public y:number = 0;

    public walls:number = 0;

    public joinedRoom = false;

    public cellUp:GenCell = null;
    public cellRight:GenCell = null;
    public cellDown:GenCell = null;
    public cellLeft:GenCell = null;

    public visited:boolean = false;

    public bossPreCell:boolean = false;


    constructor(map:GenMap, value:string="") {
        this.map = map;
        this.value = value;
    }



    public setWalls(up,right,down,left):void
    {
        if (up) this.walls |= UP;
        if (right) this.walls |= RIGHT;
        if (down) this.walls |= DOWN;
        if (left) this.walls |= LEFT;
    }

    public getEncoding():string {
        if (this.joinedRoom) return "█";
        return ENCODING[this.walls];
    }

    public isEmpty():boolean {
        return this.value=="X";
    }
    public isHallway():boolean {
        return this.value=="H"||this.value=="L"||this.value=="M";
    }
    public isRoom():boolean {
        return this.value=="R"||this.value=="S"||this.value=="K"||this.value=="C";
    }
    public isBoss():boolean {
        return this.value=="B";
    }
    public isRoomWithNoObject():boolean {
        return this.value=="R";
    }
    public isNotBossPreRoom():boolean {
        return !this.bossPreCell;
    }

    public hasTouchingHallway():boolean {
        return (this.cellUp!=null&&this.cellUp.isHallway()) ||
            (this.cellRight!=null&&this.cellRight.isHallway()) ||
            (this.cellDown!=null&&this.cellDown.isHallway()) ||
            (this.cellLeft!=null&&this.cellLeft.isHallway());
    }
    public hasOnlyTouchingHallways():boolean {
        return (this.cellUp==null||this.cellUp.isEmpty()||this.cellUp.isHallway()) &&
            (this.cellRight==null||this.cellRight.isEmpty()||this.cellRight.isHallway()) &&
            (this.cellDown==null||this.cellDown.isEmpty()||this.cellDown.isHallway()) &&
            (this.cellLeft==null||this.cellLeft.isEmpty()||this.cellLeft.isHallway());
    }
    public isCorridorLike():boolean {
        //has nothing on either side of it on one axis
        // if ((this.cellUp==null       || this.cellUp.isEmpty())
        //     &&
        //     (this.cellDown==null     || this.cellDown.isEmpty())
        //     &&
        //     (this.cellRight!=null   && !this.cellRight.isEmpty())
        //     &&
        //     (this.cellLeft!=null   && !this.cellLeft.isEmpty())
        // )
        //     return true;

        if ((this.cellRight==null       || this.cellRight.isEmpty())
            &&
            (this.cellLeft==null     || this.cellLeft.isEmpty())
            &&
            (this.cellUp!=null   && !this.cellUp.isEmpty())
            &&
            (this.cellDown!=null   && !this.cellDown.isEmpty() && !this.cellDown.isBoss())
        )
            return true;

        return false;


    }

    public isLockedDoor():boolean {
        return this.value=="L";
    }
    public isRoomWithKey():boolean {
        return this.value=="K";
    }

    public isDeadEnd():boolean {
        let sides = 0;
        if (this.cellUp!=null       && !this.cellUp.isEmpty()) sides++;
        if (this.cellRight!=null    && !this.cellRight.isEmpty()) sides++;
        if (this.cellDown!=null     && !this.cellDown.isEmpty()) sides++;
        if (this.cellLeft!=null     && !this.cellLeft.isEmpty()) sides++;

        return sides<=1;
    }

    public valueToAscii():string {
        if (this.value=="H") return "-";
        if (this.value=="X") return " ";
        return this.value;
    }
    public toEncodedString():string {
        let str = "";
        if (this.isBoss() ) str += '\x1b[31m';   //RED
        if (this.value=="M") str += '\x1b[2m\x1b[31m';  //LIGHT RED
        if (this.value=="S") str += '\x1b[32m'; //GREEN
        if (this.value=="K") str += '\x1b[35m'; //PURPLE
        if (this.value=="C") str += '\x1b[33m'; //GOLD
        if (this.value=="R") str += '\x1b[34m'; //BLUE
        if (this.value=="H") str += '\x1b[37m'; //GRAY
        str += this.getEncoding();
        str += '\x1b[0m';
        return str;
    }
    public toString(encoded:boolean=false):string {
        if (encoded) return this.toEncodedString();
        if (this.value=="S" || this.isBoss()) {
            return "{"+this.valueToAscii()+"}";
        }
        if (this.visited)
            return "["+this.valueToAscii()+"]";
        return " "+this.valueToAscii()+" ";
    }
}
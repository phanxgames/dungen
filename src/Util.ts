import {AStarFinder} from "./astar/astar";


export class Util {

    static randomInt(min:number, max:number):number { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    static randomArrayItem(coll:Array<any>):any
    {
        if (coll==null || coll.length==0) return null;
        return coll[Util.randomInt(0, coll.length-1)];
    }

    static shuffleArray(coll:Array<any>):Array<any>
    {
        for (let i = coll.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [coll[i], coll[j]] = [coll[j], coll[i]];
        }
        return coll;
    }

    static shuffleSetToArray(coll:Set<any>):Array<any>
    {
        return this.shuffleArray(Array.from(coll));
    }
    static randomSetItem(coll:Set<any>):any {
        let arr = Array.from(coll);
        return this.randomArrayItem(arr);
    }


    /**
     *
     * @param array2d
     * @param start  [x,y]
     * @param test .value === test
     */
    static findNearestReachableCell(array2d, start, test) {
        const dx = [0, 1, 0, -1];
        const dy = [1, 0, -1, 0];

        const queue = [start];
        const visited = array2d.map(row => row.map(() => false));
        visited[start[0]][start[1]] = true;

        while (queue.length > 0) {
            const [x, y] = queue.shift();

            for (let i = 0; i < 4; i++) {
                const nx = x + dx[i];
                const ny = y + dy[i];

                if (nx >= 0 && nx < array2d.length && ny >= 0 && ny < array2d[0].length && !visited[nx][ny]) {
                    if (array2d[nx][ny].value === test) {
                        return [nx, ny];
                    }

                    visited[nx][ny] = true;
                    queue.push([nx, ny]);
                }
            }
        }

        return null;
    }


    /**
     *
     * @param array2d [][]
     * @param start [x,y]
     * @param test .value === test
     * @returns [ [x,y] , .. ]
     */
    static findNearestReachableCellAndPath(array2d, start, test) {
        const dx = [0, 1, 0, -1];
        const dy = [1, 0, -1, 0];

        const queue = [start];
        const visited = array2d.map(row => row.map(() => false));
        const previous = array2d.map(row => row.map(() => null));
        visited[start[0]][start[1]] = true;

        let path = [];
        while (queue.length > 0) {
            const [x, y] = queue.shift();

            for (let i = 0; i < 4; i++) {
                const nx = x + dx[i];
                const ny = y + dy[i];

                if (nx >= 0 && nx < array2d.length && ny >= 0 && ny < array2d[0].length && !visited[nx][ny]) {
                    previous[nx][ny] = [x, y];
                    if (array2d[nx][ny].value === test) {
                        let curr = [nx, ny];
                        while (curr != null) {
                            const [px, py] = curr;
                            path.push([px,py]);
                            curr = previous[px][py];
                        }
                        return path;//[nx, ny];
                    }

                    visited[nx][ny] = true;
                    queue.push([nx, ny]);
                }
            }
        }

        return null;
    }


    static dfs(grid, x, y, visited, testPathAllowed) {
        const rows = grid.length;
        const cols = grid[0].length;

        if (x < 0 || y < 0 || x >= rows || y >= cols || visited[x][y] || testPathAllowed.indexOf(grid[x][y].value) === -1) {
            return;
        }

        visited[x][y] = true;

        this.dfs(grid, x - 1, y, visited, testPathAllowed); // left
        this.dfs(grid, x + 1, y, visited, testPathAllowed); // right
        this.dfs(grid, x, y - 1, visited, testPathAllowed); // up
        this.dfs(grid, x, y + 1, visited, testPathAllowed); // down
    }

    /**
     *
     * @param grid  2darray
     * @param testStart         "S"
     * @param testRoom          "R"
     * @param testPathAllowed   "SRH" - must have "S" or stack overflow
     * @returns [[x,y], ..] if found, or false
     */
    static hasUnreachableCells(grid, testStart, testRoom, testPathAllowed) {

        if (testPathAllowed.indexOf(testStart)===-1)
            testPathAllowed+=testStart;

        const rows = grid.length;
        const cols = grid[0].length;

        let startX, startY;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (grid[i][j].value == testStart) {
                    startX = i;
                    startY = j;
                    break;
                }
            }
        }

        let visited = Array.from({length: rows}, () => Array(cols).fill(false));
        this.dfs(grid, startX, startY, visited, testPathAllowed);

        let out = [];
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (testRoom.indexOf(grid[i][j].value) >= 0 && !visited[i][j]) {
                    out.push ([i,j]); // unreachable cell found
                }
            }
        }

        return out.length>0?out:false; // all cell are reachable
    }


    public static findAStar():void {

    }


}
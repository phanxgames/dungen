const fs = require("fs");
const path = require("path");
const tmx = require('tmx-parser');


export class UtilFiles {

    static createDirectory(dir:string):void {
        try {
            fs.mkdirSync(dir);
        } catch (e) {}
    }

    static readFile(path:string):string {
        return fs.readFileSync(path);
    }

    static async loadTmx(path:string):Promise<any> {
        return new Promise(resolve => {
            tmx.parseFile(path, function (err, map) {
                if (err) throw err;
                console.log(map);
                resolve(map);
            });
        });
    }

    static saveFile(path:string, data:string):void {
        fs.writeFileSync(path, data);
    }

    static copyFile(source:string, target:string) {
        var targetFile = target;

        //if target is a directory a new file with the same name will be created
        if ( fs.existsSync( target ) ) {
            if ( fs.lstatSync( target ).isDirectory() ) {
                targetFile = path.join( target, path.basename( source ) );
            }
        }

        fs.writeFileSync(targetFile, fs.readFileSync(source));
    }

    static copyFiles(source:string, target:string) {

        var files = [];

        //check if folder needs to be created or integrated
        var targetFolder = path.join( target, path.basename( source ) );
        if ( !fs.existsSync( targetFolder ) ) {
            fs.mkdirSync( targetFolder );
        }

        //copy
        if ( fs.lstatSync( source ).isDirectory() ) {
            files = fs.readdirSync( source );
            files.forEach( function ( file ) {
                var curSource = path.join( source, file );
                if ( fs.lstatSync( curSource ).isDirectory() ) {
                    UtilFiles.copyFiles( curSource, targetFolder );
                } else {
                    UtilFiles.copyFile( curSource, targetFolder );
                }
            } );
        }

    }


    static removeDirectory(dirPath:string):void {
        let files;
        try { files = fs.readdirSync(dirPath); }
        catch(e) { return; }
        if (files.length > 0)
            for (let i = 0; i < files.length; i++) {
                let filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else {

                    this.removeDirectory(filePath);
                }

            }
        fs.rmdirSync(dirPath);
    }

    static renameDirectory(oldPath:string, newPath:string):void {
        fs.renameSync(oldPath, newPath);
    }

    static loadJsonFromPath(path:string):any {
        let config:any = fs.readFileSync(path).toString("utf8").trim();
        return JSON.parse(config);
    }


}
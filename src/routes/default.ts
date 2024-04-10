import {Application, Request, Response, NextFunction} from "express";
import * as fs from "node:fs";
import * as path from "node:path";

const __driveRoot = '/tmp/drive'

function getDrive(req: Request, res: Response) {
    fs.mkdirSync("/tmp/drive", {recursive: true});
    const drive = fs.readdirSync("/tmp/drive");
    let json: any[] = [];
    drive.forEach((file) => {
        const filePath = path.join( __driveRoot, file)
        if (fs.statSync(filePath).isDirectory()) {
            json.push({
                name: file,
                isFolder: true,
            });
        } else {
            json.push({
                name: file,
                isFolder: false,
                size: fs.statSync(filePath).size
            });
        }
    });
    console.log(json)
    res.status(200).json(json);
}

function fillJson(json: any[]) {
    return (file: any) => {
        const filePath = path.join(__driveRoot, file)
        if (fs.statSync(filePath).isDirectory()) {
            json.push({
                name: file,
                isFolder: true,
            });
        } else {
            json.push({
                name: file,
                isFolder: false,
                size: fs.statSync(`/tmp/drive/${file}/${file}`).size
            });
        }
    };
}

/**
 * Get the files and folders in a folder
 * @param req
 * @param res
 */
function getFolder(req: Request, res: Response) {
    const file = req.params.name;
    const root = __driveRoot;
    if(!fs.existsSync(`/tmp/drive/${file}`)){
        res.status(404).json({message: "Not found"});
        return;
    }
    if(!fs.statSync(`/tmp/drive/${file}`).isDirectory()){
        return getFile(req, res);
    }
    const drive = fs.readdirSync(`/tmp/drive/${file}`);
    let json: any[] = [];
    drive.forEach(fillJson(json));
    res.status(200).json(json);
}

function getFile(req: Request, res: Response) {
    const fileName = req.params.name
    let filePath = path.join(__driveRoot, fileName);
    if(!fs.existsSync(filePath)){
        res.status(404).json({message: filePath + " Not found"});
        return;
    }

    const file = fs.readFileSync(filePath)
    console.log('File: ', file.toString())

    res.status(200).sendFile(fileName, {root: __driveRoot}, (err) => {
        if(err){
            res.status(500).json({message: err.message})
        }

    })

}

export {getDrive, getFolder}
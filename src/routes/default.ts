import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const __driveRoot = '/tmp/drive';

interface DriveItem {
    name: string;
    isFolder: boolean;
    size?: number;
}

function getDrive(req: Request, res: Response) {
    fs.mkdirSync(__driveRoot, { recursive: true });
    const drive = fs.readdirSync(__driveRoot);
    const json: DriveItem[] = [];
    drive.forEach((file) => {
        const filePath = path.join(__driveRoot, file);
        const stats = fs.statSync(filePath);
        json.push({
            name: file,
            isFolder: stats.isDirectory(),
            size: stats.isDirectory() ? undefined : stats.size
        });
    });
    console.log(json);
    res.status(200).json(json);
}

function fillJson(json: DriveItem[], folder: string) {
    return (file: string) => {
        const filePath = path.join(__driveRoot, folder, file);
        const stats = fs.statSync(filePath);
        json.push({
            name: file,
            isFolder: stats.isDirectory(),
            size: stats.isDirectory() ? undefined : fs.statSync(filePath).size
        });
    };
}

function getFolder(req: Request, res: Response) {
    const folder = req.params.name;
    if (!fs.existsSync(path.join(__driveRoot, folder))) {
        res.status(404).json({ message: "Not found" });
        return;
    }
    if (!fs.statSync(path.join(__driveRoot, folder)).isDirectory()) {
        return getFile(req, res);
    }
    const drive = fs.readdirSync(path.join(__driveRoot, folder));
    const json: DriveItem[] = [];
    drive.forEach(fillJson(json, folder));
    res.status(200).json(json);
}

function getFile(req: Request, res: Response) {
    const fileName = req.params.name;
    const filePath = path.join(__driveRoot, fileName);
    if (!fs.existsSync(filePath)) {
        res.status(404).json({ message: `${fileName} Not found` });
        return;
    }
    console.log('File: ', fileName);
    res.status(200).sendFile(fileName, { root: __driveRoot }, (err) => {
        if (err) {
            res.status(500).json({ message: err.message });
        }
    });
}

export { getDrive, getFolder };

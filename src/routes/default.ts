import { Request, Response } from "express";
import fs from "fs";
import os from "os";
import path from "path";

const __driveRoot = path.join(os.tmpdir(), 'drive');

interface DriveItem {
    name: string;
    isFolder: boolean;
    size?: number;
}

/* region GET */

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

/* endregion GET */

/* region POST */

function postFolder(req: Request, res: Response) {
    const folder = req.query.name as string;
    const folderPath = path.join(__driveRoot, folder)

    // Check if folder name contains non-alphanumeric characters
    const re = new RegExp(/^[a-z0-9]+$/i);
    if(!folder.match(re) && folder.length !== 0)
    {
        res.status(400).json({ message: "Non-alphanumeric characters not allowed"})
        return;
    }

    if(!fs.existsSync(folderPath))
    {
        fs.mkdirSync(folderPath)
    }
    else
    {
        res.status(400).json({ message: "Folder already exists"})
        return;
    }
    res.status(201).send();
}

function postFile(req: Request, res: Response) {
    const folder = req.params.name;
    const fileName = req.query.name as string;
    console.log('File: ', fileName);
    console.log('Folder: ', folder);
    console.log('Body: ', req);
    let filePath;
    if(folder)
    {
        path.join(__driveRoot, folder, fileName)
    }
    else
    {
        filePath = path.join(__driveRoot, fileName)
    }

    // Check if file name contains non-alphanumeric characters
    const re = new RegExp(/^[a-z0-9]+$/i);
    if(!fileName.match(re) && fileName.length !== 0)
    {
        res.status(400).json({ message: "Non-alphanumeric characters not allowed"})
    }

    if(fs.existsSync(filePath))
    {
        res.status(400).json({ message: "File already exists"})
    }
    fs.writeFileSync(filePath, req.body)
    res.status(201).send();
}

/* endregion POST */

export { getDrive, getFolder, postFolder, postFile };

import {Request, Response} from "express";
import fs from "fs";
import os from "os";
import path from "path";

const __driveRoot = path.join(os.tmpdir(), 'drive');

interface DriveItem {
    name: string;
    isFolder: boolean;
    size?: number;
}

interface FileRequest extends Request {
    files: any;
}

/* region GET */


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
    const folder = req.path.replace('/api/drive/', '');

    let folderPath = path.join(__driveRoot, folder);
    if (!fs.existsSync(folderPath)) {
        res.status(404).json({message: `${folderPath} not found`});
        return;
    }
    if (!fs.statSync(folderPath).isDirectory()) {
        return getFile(req, res);
    }
    const drive = fs.readdirSync(folderPath);
    const json: DriveItem[] = [];
    drive.forEach(fillJson(json, folder));
    res.status(200).json(json);
}

function getFile(req: Request, res: Response) {
    const folder = req.path.replace('/api/drive', '');
    let paths = folder.split('/');
    const fileName = paths[paths.length - 1];
    const filePath = path.join(__driveRoot, folder);
    if (!fs.existsSync(filePath)) {
        res.status(404).json({message: `${fileName} Not found`});
        return;
    }
    res.status(200).sendFile(fileName, {root: __driveRoot}, (err) => {
        if (err) {
            res.status(500).json({message: err.message});
            return;
        }
    });
}

/* endregion GET */

/* region POST */

function postFolder(req: Request, res: Response) {
    const folder = req.query.name as string;

    const fullPath = req.path.replace('/api/drive', '');
    const folderPath = path.join(__driveRoot, fullPath, folder)

    // Check if folder name contains non-alphanumeric characters
    const re = new RegExp(/^[a-z0-9._-]+$/i);
    if (!folder.match(re) && folder.length !== 0) {
        res.status(400).json({message: "Non-alphanumeric characters not allowed"})
        return;
    }

    // Check if parent folder already exists
    if (!fs.existsSync(path.join(__driveRoot, fullPath))) {
        res.status(404).json({message: "Parent folder not found"})
        return;
    }

    if (!fs.existsSync(folderPath)) {
        fs.promises.mkdir(folderPath).then(() => {
            res.status(201).send();
            return;
        });
    } else {
        res.status(400).json({message: "Folder already exists"})
        return;
    }
}


/* endregion POST */

/* region PUT */

function putFile(req: Request, res: Response) {
    const folder = req.path.replace('/api/drive', '');
    const fileReq = req as FileRequest
    if (!fileReq.files) {
        res.status(400).json({message: "No file uploaded"})
        return;
    }


    const file = fileReq.files.file

    const fileName = file.filename;
    let filePath = path.join(__driveRoot, folder, fileName)


    if (fs.existsSync(filePath)) {
        res.status(400).json({message: "File already exists"})
        fs.rmSync(path.join(file.file, '../../'), {recursive: true})
        return
    }
    fs.copyFileSync(file.file, filePath);
    fs.rmSync(path.join(file.file, '../../'), {recursive: true})
    res.status(201).send();
}


/* endregion PUT */

/* region DELETE */

function deleteFile(req: Request, res: Response) {
    const folder = req.path.replace('/api/drive/', '');
    let paths = folder.split('/');
    const fileName = paths[paths.length - 1];
    let filePath = path.join(__driveRoot, folder)

    const re = new RegExp(/^[a-z0-9._-]+$/i);
    if (!fileName.match(re) && fileName.length !== 0) {
        res.status(400).json({message: "File/Folder not provided"})
        return;
    }
    if (!fs.existsSync(filePath)) {
        res.status(404).json({message: `File/Folder ${fileName} not found`})
        return;
    }

    fs.promises.stat(filePath).then((() => {
        fs.promises.rm(filePath, {recursive: true}).then((() => {
            res.status(200).send();
        }));
    }))

}

/* endregion DELETE */

export {getFolder, postFolder, putFile, deleteFile};

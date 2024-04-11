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

async function getFolder(req: Request, res: Response) {
    const folder = req.path.replace('/api/drive/', '');

    let folderPath = path.join(__driveRoot, folder);

    try {
        await fs.promises.access(folderPath)
    } catch (e) {
        res.status(404).json({message: `${folderPath} not found`})
        return;
    }

    const stat = await fs.promises.stat(folderPath);
    if (!stat.isDirectory()) {
        return getFile(req, res);
    }
    const drive = await fs.promises.readdir(folderPath)
    const json: DriveItem[] = [];
    for (const file of drive) {
        const filePath = path.join(__driveRoot, folder, file);
        const stats = await fs.promises.stat(filePath);
        json.push({
            name: file,
            isFolder: stats.isDirectory(),
            size: stats.isDirectory() ? undefined : stats.size
        });
    }
    res.status(200).json(json);


}

async function getFile(req: Request, res: Response) {
    const folder = req.path.replace('/api/drive', '');
    let paths = folder.split('/');
    const fileName = paths[paths.length - 1];
    const filePath = path.join(__driveRoot, folder);

    try {
        await fs.promises.access(filePath)
    } catch (e) {
        res.status(404).json({message: `${fileName} Not found`})
        return;
    }
    res.status(200).sendFile(folder, {root: __driveRoot}, (err) => {
        if (err) {
            res.status(500).json({message: err.message});
            return;
        }
    });
}

/* endregion GET */

/* region POST */

async function postFolder(req: Request, res: Response) {
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
    try {
        await fs.promises.access(path.join(__driveRoot, fullPath))
    } catch (e) {
        res.status(404).json({message: "Parent folder not found"})
        return;
    }

    try {
        await fs.promises.access(folderPath)
        res.status(400).json({message: "Folder already exists"})
        return;
    } catch (e) {
        await fs.promises.mkdir(folderPath)
        res.status(201).send();
        return;
    }


}


/* endregion POST */

/* region PUT */

async function putFile(req: Request, res: Response) {
    const folder = req.path.replace('/api/drive', '');
    const fileReq = req as FileRequest
    if (!fileReq.files) {
        res.status(400).json({message: "No file uploaded"})
        return;
    }


    const file = fileReq.files.file

    const fileName = file.filename;
    let filePath = path.join(__driveRoot, folder, fileName)

    try{
        await fs.promises.access(filePath)

        res.status(400).json({message: "File already exists"})
        await fs.promises.rm(path.join(file.file, '../../'), {recursive: true})
        return
    } catch (e) {
        await fs.promises.copyFile(file.file, filePath);
        await fs.promises.rm(path.join(file.file, '../../'), {recursive: true})
        res.status(201).send();
        return;
    }

}


/* endregion PUT */

/* region DELETE */

async function deleteFile(req: Request, res: Response) {
    const folder = req.path.replace('/api/drive/', '');
    let paths = folder.split('/');
    const fileName = paths[paths.length - 1];
    let filePath = path.join(__driveRoot, folder)

    const re = new RegExp(/^[a-z0-9._-]+$/i);
    if (!fileName.match(re) && fileName.length !== 0) {
        res.status(400).json({message: "File/Folder not provided"})
        return;
    }

    try{
        await fs.promises.access(filePath)
    } catch (e) {
        res.status(404).json({message: `File/Folder ${fileName} not found`})
        return;
    }


    await fs.promises.stat(filePath)

    await fs.promises.rm(filePath, {recursive: true})

    res.status(200).send();

}

/* endregion DELETE */

export {getFolder, postFolder, putFile, deleteFile};

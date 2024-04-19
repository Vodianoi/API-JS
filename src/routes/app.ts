import {NextFunction, Request, Response} from "express";
import fs from "fs";
import os from "os";
import path from "path";
import {access, createDir, getFolder, getStats, isAlphaNumerical, moveUploadedFile, search} from "./utils";
import DriveError from "../errors/DriveError";

const __driveRoot = path.join(os.tmpdir(), 'drive');

export interface DriveItem {
    name: string;
    isFolder: boolean;
    size?: number;
}

type FileRequest = Request & { files: any }

/* region GET */

async function handleGet(req: Request, res: Response, next: NextFunction) {
    try {
        const folder = req.path.replace('/api/drive/', '');

        //Search method
        if (req.query.search) {
            const files = await search(req.query.search as string)
            res.status(200).send(files)
            return;
        }

        let folderPath = path.join(__driveRoot, folder);
        const stat = await getStats(folderPath);
        if (await access(folderPath)) {
            if (!stat.isDirectory()) {
                res.status(200).sendFile(folder, {root: __driveRoot});
            } else {
                const json = await getFolder(folderPath, folder);
                res.status(200).json(json);
            }
        }
    } catch (e) {
        next(e);
    }
}


/* endregion GET */

/* region POST */

async function handlePost(req: Request, res: Response, next: NextFunction) {
    try {
        const folder = req.query.name as string;

        const fullPath = req.path.replace('/api/drive/', '');
        const folderPath = path.join(__driveRoot, fullPath, folder)

        // Check if folder name contains non-alphanumeric characters
        if (isAlphaNumerical(folder)) {
            // Check if parent folder already exists
            await createDir(fullPath, folderPath);
        }

        res.status(201).send();
    } catch (e) {
        next(e)
    }
}


/* endregion POST */

/* region PUT */

async function handlePut(req: Request, res: Response, next: NextFunction) {
    try {
        const folder = req.path.replace('/api/drive', '');
        const fileReq = req as FileRequest
        if (!fileReq.files.file) {
            throw new DriveError(400, "No file uploaded")
        }
        const file = fileReq.files.file

        const fileName = file.filename;
        let filePath = path.join(__driveRoot, folder, fileName)

        const folderPath = path.join(__driveRoot, folder);
        await moveUploadedFile(folderPath, file);
        res.status(201).send();

    } catch (e) {
        if ((req as FileRequest).files.file) {
            await fs.promises.rm(path.join((req as FileRequest).files.file.file, '../../'), {recursive: true})
        }
        next(e)
    }
}

/* endregion PUT */

/* region DELETE */

async function handleDelete(req: Request, res: Response, next: NextFunction) {
    try {
        const folder = req.path.replace('/api/drive/', '');
        let paths = folder.split('/');
        const fileName = paths[paths.length - 1];
        let filePath = path.join(__driveRoot, folder)

        if (fileName === '') {
            throw new DriveError(400, "File/Folder not provided")
        }

        if (isAlphaNumerical(fileName) && await access(filePath)) {
            await fs.promises.rm(filePath, {recursive: true})
        }
        res.status(200).send();
    } catch (e) {
        next(e)
    }

}

/* endregion DELETE */

export {handleGet, handlePost, handlePut, handleDelete};

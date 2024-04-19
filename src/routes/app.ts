import {NextFunction, Request, Response} from "express";
import fs from "fs";
import os from "os";
import path from "path";
import {throughDirectoryLike} from "./utils";
import DriveError from "../errors/DriveError";

const __driveRoot = path.join(os.tmpdir(), 'drive');

export interface DriveItem {
    name: string;
    isFolder: boolean;
    size?: number;
}

type FileRequest = Request & { files: any }

/* region GET */

async function getFolder(folderPath: string, folder: string) {
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
    return json;
}

async function getStats(folderPath: string) {
    try {
        return await fs.promises.stat(folderPath);
    } catch (e) {
        throw new DriveError(404, `${folderPath} not found`)
    }
}

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

async function access(path: string) {
    try {
        await fs.promises.access(path)
        return true;
    } catch (e) {
        throw new DriveError(404, `${path} not found`)
    }
}

async function checkAlreadyExists(path: string) {
    try {
        await fs.promises.access(path)
    } catch (e) {
        return false;
    }
    throw new DriveError(400, "Folder already exists")

}


async function search(search: string) {
    return throughDirectoryLike(new RegExp(search, "i"));
}


/* endregion GET */

/* region POST */

function isAlphaNumerical(folder: string) {
    const re = new RegExp(/^[a-z0-9._-]+$/i);
    if (!folder.match(re) && folder.length !== 0) {
        throw new DriveError(400, "Non-alphanumeric characters not allowed")
    }
    return true;
}

async function createDir(fullPath: string, folderPath: string) {
    if (await access(path.join(__driveRoot, fullPath))
        && !await checkAlreadyExists(folderPath)) {
        await fs.promises.mkdir(folderPath)
    }
}

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

async function moveUploadedFile(filePath: string, folderPath: string, file: any) {
    if (!await checkAlreadyExists(filePath) && await access(folderPath)) {
        await fs.promises.mkdir(folderPath, {recursive: true});
        await fs.promises.copyFile(file.file, filePath);
        await fs.promises.rm(path.join(file.file, '../../'), {recursive: true})
    }
}

async function handlePut(req: Request, res: Response, next: NextFunction) {
    try {
        const folder = req.path.replace('/api/drive', '');
        const fileReq = req as FileRequest
        if (!fileReq.files) {
            throw new DriveError(400, "No file uploaded")
        }
        const file = fileReq.files.file

        const fileName = file.filename;
        let filePath = path.join(__driveRoot, folder, fileName)

        const folderPath = path.join(__driveRoot, folder);
        await moveUploadedFile(filePath, folderPath, file);
        res.status(201).send();

    } catch (e) {
        if ((req as FileRequest).files) {
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

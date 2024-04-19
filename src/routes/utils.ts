import fs from "fs";
import os from 'os';
import path from "path";
import {DriveItem} from "./app";
import DriveError from "../errors/DriveError";

const __driveRoot = path.join(os.tmpdir(), 'drive');

/**
 * Recursively find all files in the directory
 * @param folder
 */
export async function throughDirectory(folder: string) {
    const files: DriveItem[] = []
    const nodeFiles = await fs.promises.readdir(folder);

    for (const file of nodeFiles) {
        const absolute = path.join(folder, file);
        const stats = await fs.promises.stat(absolute);
        files.push({
            name: file,
            isFolder: stats.isDirectory(),
            size: stats.isDirectory() ? undefined : stats.size
        });
        if (stats.isDirectory()) {
            files.push(...await throughDirectory(absolute));
        }
    }
    return files;
}

/**
 * Recursively find all files in the directory that match the regex
 * @param regex
 * @param folder
 */
export async function throughDirectoryLike(regex: RegExp, folder?: string) {
    const files: DriveItem[] = await throughDirectory(folder || __driveRoot);
    return files.filter(file => regex.test(file.name));
}

export async function getFolder(folderPath: string, folder: string) {
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

export async function getStats(folderPath: string) {
    try {
        return await fs.promises.stat(folderPath);
    } catch (e) {
        throw new DriveError(404, `${folderPath} not found`)
    }
}

export async function access(path: string) {
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
    throw new DriveError(400, `Folder/File ${path} already exists`)

}

export async function search(search: string) {
    return throughDirectoryLike(new RegExp(search, "i"));
}

export function isAlphaNumerical(folder: string) {
    const re = new RegExp(/^[a-z0-9._-]+$/i);
    if (!folder.match(re) && folder.length !== 0) {
        throw new DriveError(400, "Non-alphanumeric characters not allowed")
    }
    return true;
}

export async function createDir(fullPath: string, folderPath: string) {
    if (await access(path.join(__driveRoot, fullPath))
        && !await checkAlreadyExists(folderPath)) {
        await fs.promises.mkdir(folderPath)
    }
}

export async function moveUploadedFile(folderPath: string, file: any) {
    const filePath = path.join(folderPath, file.filename);
    if (!await checkAlreadyExists(filePath) && await access(folderPath)) {
        await fs.promises.mkdir(folderPath, {recursive: true});
        await fs.promises.rename(file.file, filePath)
    }
}
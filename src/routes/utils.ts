import fs from "fs";
import os from 'os';
import path from "path";
import {DriveItem} from "./app";

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
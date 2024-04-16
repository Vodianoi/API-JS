import fs from "fs";
import os from 'os';
import path from "path";
import {DriveItem} from "./app";

const __driveRoot = path.join(os.tmpdir(), 'drive');

export function throughDirectory(folder: string) {
    const files: DriveItem[] = []
    fs.readdirSync(folder).forEach(file => {
        const absolute = path.join(folder, file);
        const stats = fs.statSync(absolute);
        files.push({
            name: absolute,
            isFolder: stats.isDirectory(),
            size: stats.isDirectory() ? undefined : stats.size
        });
        if (stats.isDirectory()) {
            files.push(...throughDirectory(absolute));
        }
    });
    return files;
}

/**
 * Find all files in the directory that match the regex, recursively
 * @param regex
 * @param folder
 */
export function throughDirectoryLike(regex: RegExp, folder?: string) {
    const files: DriveItem[] = throughDirectory(folder || __driveRoot);
    return files.filter(file => regex.test(file.name));
}
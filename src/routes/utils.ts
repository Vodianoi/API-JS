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
        if (stats.isDirectory()) {
            files.push({
                name:absolute,
                isFolder:stats.isDirectory(),
                size:stats.size
            })
            files.push(...throughDirectory(absolute));
        }
        else {
            files.push({
                name: absolute,
                isFolder: stats.isDirectory(),
                size: stats.isDirectory() ? undefined : stats.size
            });
            return files;
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
    const files: DriveItem[] = []
    fs.readdirSync(folder ?? __driveRoot).forEach(file => {

        const absolute = path.join(folder ?? __driveRoot, file);
        const stats = fs.statSync(absolute);
        if (file.match(regex)) {
            files.push({
                name: path.join(folder ?? __driveRoot, file),
                isFolder: stats.isDirectory(),
                size: stats.isDirectory() ? undefined : stats.size
            })
        }
        if (stats.isDirectory()) {
            files.push(...throughDirectoryLike(regex, absolute));
        }
    });
    return files;
}
import path from "path";
import fs from 'fs'
import {throughDirectory, throughDirectoryLike} from "../routes/utils";

describe('throughDirectory function', () => {
    const testFolderPath = path.join(__dirname, 'testFolder');

    // Mocking fs.readdirSync and fs.statSync
    jest.mock('fs');

    interface MockStats {
        isDirectory: () => boolean
        size?: number
    }

    const readdirSync = jest.spyOn(fs, 'readdirSync') as unknown as jest.SpyInstance<string[]>;
    const statSync = jest.spyOn(fs, 'statSync') as unknown as jest.SpyInstance<MockStats>;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return an array of files in the directory', () => {
        const testFiles = ['file1.txt', 'file2.txt'];
        const expectedFiles = [
            {name: 'file1.txt', isFolder: false, size: 100},
            {name: 'file2.txt', isFolder: false, size: 150},
        ];

        // Mocking fs.readdirSync to return testFiles

        readdirSync.mockReturnValue(testFiles);

        // Mocking fs.statSync to return appropriate stats for each file
        statSync
            .mockReturnValueOnce({isDirectory: () => false, size: 100})
            .mockReturnValueOnce({isDirectory: () => false, size: 150});

        const result = throughDirectory(testFolderPath);
        expect(result).toEqual(expectedFiles);
    });

    it('should handle nested directories', () => {
        const testFiles = ['file1.txt', 'subFolder'];
        const testFiles2 = ['subFile.txt'];
        const expectedFiles = [
            {name:  'file1.txt', isFolder: false, size: 100},
            {name:  'subFolder', isFolder: true, size: undefined},
            {name:  'subFile.txt', isFolder: false, size: 100},
        ];

        // Mocking fs.readdirSync to return testFiles
        readdirSync
            .mockReturnValueOnce(testFiles)
            .mockReturnValueOnce(testFiles2);

        // Mocking fs.statSync to return appropriate stats for each file
        statSync
            .mockReturnValueOnce({isDirectory: () => false, size: 100})
            .mockReturnValueOnce({isDirectory: () => true})
            .mockReturnValueOnce({isDirectory: () => false, size: 100})

        const result = throughDirectory(testFolderPath);
        expect(result).toEqual(expectedFiles);
    });
});


describe('throughDirectoryLike function', () => {
    const testFolderPath = path.join(__dirname, 'testFolder');

    // Mocking fs.readdirSync and fs.statSync
    jest.mock('fs');

    interface MockStats {
        isDirectory: () => boolean
        size?: number
    }

    const readdirSync = jest.spyOn(fs, 'readdirSync') as unknown as jest.SpyInstance<string[]>;
    const statSync = jest.spyOn(fs, 'statSync') as unknown as jest.SpyInstance<MockStats>;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return an array of files in the directory', () => {
        const testFiles = ['file1.txt', 'file2.txt'];
        const expectedFiles = [
            {name: 'file1.txt', isFolder: false, size: 100},
            {name: 'file2.txt', isFolder: false, size: 150},
        ];

        // Mocking fs.readdirSync to return testFiles

        readdirSync.mockReturnValue(testFiles);

        // Mocking fs.statSync to return appropriate stats for each file
        statSync
            .mockReturnValueOnce({isDirectory: () => false, size: 100})
            .mockReturnValueOnce({isDirectory: () => false, size: 150});

        const result = throughDirectoryLike(/file/i, testFolderPath);
        expect(result).toEqual(expectedFiles);
    });

    it('should handle nested directories', () => {
        const testFiles = ['testFile1.txt', 'subTestFolder'];
        const testFiles2 = ['subTestFile.txt'];
        const expectedFiles = [
            {name: 'testFile1.txt', isFolder: false, size: 100},
            {name: 'subTestFolder', isFolder: true, size: undefined},
            {name: 'subTestFile.txt', isFolder: false, size: 100},
        ];

        // Mocking fs.readdirSync to return testFiles
        readdirSync
            .mockReturnValueOnce(testFiles)
            .mockReturnValueOnce(testFiles2);

        // Mocking fs.statSync to return appropriate stats for each file
        statSync
            .mockReturnValueOnce({isDirectory: () => false, size: 100})
            .mockReturnValueOnce({isDirectory: () => true})
            .mockReturnValueOnce({isDirectory: () => false, size: 100})

        const result = throughDirectoryLike(/test/i, testFolderPath);
        expect(result).toEqual(expectedFiles);
    });
});
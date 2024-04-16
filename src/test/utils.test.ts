import path from "path";
import fs from 'node:fs/promises'
import {throughDirectory, throughDirectoryLike} from "../routes/utils";

describe('throughDirectory function', () => {
    const testFolderPath = path.join(__dirname, 'testFolder');

    interface MockStats {
        isDirectory: () => boolean
        size?: number
    }

    const readdir = jest.spyOn(fs, 'readdir') as unknown as jest.SpyInstance<Promise<string[]>>;
    const stat = jest.spyOn(fs, 'stat') as unknown as jest.SpyInstance<Promise<MockStats>>;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return an array of files in the directory', async () => {
        const testFiles = ['file1.txt', 'file2.txt'];
        const expectedFiles = [
            {name: 'file1.txt', isFolder: false, size: 100},
            {name: 'file2.txt', isFolder: false, size: 150},
        ];

        // Mocking fs.readdir to return testFiles

        readdir.mockResolvedValue(testFiles);

        // Mocking fs.stat to return appropriate stats for each file
        stat
            .mockResolvedValueOnce({isDirectory: () => false, size: 100})
            .mockResolvedValueOnce({isDirectory: () => false, size: 150});

        const result = await throughDirectory(testFolderPath);
        expect(result).toEqual(expectedFiles);
    });

    it('should handle nested directories', async () => {
        const testFiles = ['file1.txt', 'subFolder'];
        const testFiles2 = ['subFile.txt'];
        const expectedFiles = [
            {name:  'file1.txt', isFolder: false, size: 100},
            {name:  'subFolder', isFolder: true, size: undefined},
            {name:  'subFile.txt', isFolder: false, size: 100},
        ];

        // Mocking fs.readdir to return testFiles
        readdir
            .mockResolvedValueOnce(testFiles)
            .mockResolvedValueOnce(testFiles2);

        // Mocking fs.stat to return appropriate stats for each file
        stat
            .mockResolvedValueOnce({isDirectory: () => false, size: 100})
            .mockResolvedValueOnce({isDirectory: () => true})
            .mockResolvedValueOnce({isDirectory: () => false, size: 100})

        const result = await throughDirectory(testFolderPath);
        expect(result).toEqual(expectedFiles);
    });
});


describe('throughDirectoryLike function', () => {
    const testFolderPath = path.join(__dirname, 'testFolder');

    interface MockStats {
        isDirectory: () => boolean
        size?: number
    }

    const readdir = jest.spyOn(fs, 'readdir') as unknown as jest.SpyInstance<Promise<string[]>>;
    const stat = jest.spyOn(fs, 'stat') as unknown as jest.SpyInstance<Promise<MockStats>>;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return an array of files in the directory', async () => {
        const testFiles = ['file1.txt', 'file2.txt'];
        const expectedFiles = [
            {name: 'file1.txt', isFolder: false, size: 100},
            {name: 'file2.txt', isFolder: false, size: 150},
        ];

        // Mocking fs.readdir to return testFiles

        readdir.mockResolvedValue(testFiles);

        // Mocking fs.stat to return appropriate stats for each file
        stat
            .mockResolvedValueOnce({isDirectory: () => false, size: 100})
            .mockResolvedValueOnce({isDirectory: () => false, size: 150});

        const result = await throughDirectoryLike(/file/i, testFolderPath);
        expect(result).toEqual(expectedFiles);
    });

    it('should handle nested directories', async () => {
        const testFiles = ['testFile1.txt', 'subTestFolder'];
        const testFiles2 = ['subTestFile.txt'];
        const expectedFiles = [
            {name: 'testFile1.txt', isFolder: false, size: 100},
            {name: 'subTestFolder', isFolder: true, size: undefined},
            {name: 'subTestFile.txt', isFolder: false, size: 100},
        ];

        // Mocking fs.readdir to return testFiles
        readdir
            .mockResolvedValueOnce(testFiles)
            .mockResolvedValueOnce(testFiles2);

        // Mocking fs.stat to return appropriate stats for each file
        stat
            .mockResolvedValueOnce({isDirectory: () => false, size: 100})
            .mockResolvedValueOnce({isDirectory: () => true})
            .mockResolvedValueOnce({isDirectory: () => false, size: 100})

        const result = await throughDirectoryLike(/test/i, testFolderPath);
        expect(result).toEqual(expectedFiles);
    });
});
import path from "path";
import fs from 'node:fs/promises'
import {
    access,
    getFolder,
    getStats,
    isAlphaNumerical, moveUploadedFile,
    search,
    throughDirectory,
    throughDirectoryLike
} from "../routes/utils";

interface MockStats {
    isDirectory: () => boolean
    size?: number
}

describe('throughDirectory function', () => {
    const testFolderPath = path.join(__dirname, 'testFolder');

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
            {name: 'file1.txt', isFolder: false, size: 100},
            {name: 'subFolder', isFolder: true, size: undefined},
            {name: 'subFile.txt', isFolder: false, size: 100},
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


describe('getFolder function', () => {
    const testFolderPath = path.join(__dirname, 'testFolder');


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

        const result = await getFolder(testFolderPath, 'testFolder');
        expect(result).toEqual(expectedFiles);
    });

})

describe('getStats function', () => {
    const testFolderPath = path.join(__dirname, 'testFolder');


    const stat = jest.spyOn(fs, 'stat') as unknown as jest.SpyInstance<Promise<MockStats>>;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return the stats of the folder', async () => {
        const expectedStats = {isDirectory: () => true};

        // Mocking fs.stat to return appropriate stats for each file
        stat.mockResolvedValue(expectedStats);

        const result = await getStats(testFolderPath);
        expect(result).toEqual(expectedStats);
    });

    it('should throw an error if the folder does not exist', async () => {
        // Mocking fs.stat to throw an error
        stat.mockRejectedValue(new Error('Folder does not exist'));

        await expect(getStats(testFolderPath)).rejects.toThrow(`${testFolderPath} not found`);
    });

    it('should return file stats', async () => {
        const expectedStats = {isDirectory: () => false, size: 100};

        // Mocking fs.stat to return appropriate stats for each file
        stat.mockResolvedValue(expectedStats);

        const result = await getStats(testFolderPath);
        expect(result).toEqual(expectedStats);
    })

})

describe('access function', () => {
    const testFolderPath = path.join(__dirname, 'testFolder');

    const accessMock = jest.spyOn(fs, 'access') as unknown as jest.SpyInstance<Promise<void>>;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return true if the folder exists', async () => {
        // Mocking fs.access to return undefined
        accessMock.mockResolvedValue(undefined);

        const result = await access(testFolderPath);
        expect(result).toBe(true);
    });

    it('should throw an error if the folder does not exist', async () => {
        // Mocking fs.access to throw an error
        accessMock.mockRejectedValue(new Error('Folder does not exist'));

        await expect(access(testFolderPath)).rejects.toThrow(`${testFolderPath} not found`);
    });

})

describe('search function', () => {
    const testFolderPath = path.join(__dirname, 'testFolder');

    const readdir = jest.spyOn(fs, 'readdir') as unknown as jest.SpyInstance<Promise<string[]>>;
    const stat = jest.spyOn(fs, 'stat') as unknown as jest.SpyInstance<Promise<MockStats>>;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return an array of files that match the search', async () => {
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

        const result = await search('file');
        expect(result).toEqual(expectedFiles);
    });

    it('should handle nested directories', async () => {
        const testFiles = ['file1.txt', 'subFolder'];
        const testFiles2 = ['subFile.txt'];
        const expectedFiles = [
            {name: 'file1.txt', isFolder: false, size: 100},
            {name: 'subFile.txt', isFolder: false, size: 100},
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

        const result = await search('file');
        console.log(result);
        expect(result).toEqual(expectedFiles);
    });
})

describe('alphaNumerical function', () => {
    it('should return true if the string is alphanumeric', () => {
        const result = isAlphaNumerical('test');
        expect(result).toBe(true);
    });

    it('should throw error if the string is not alphanumeric', () => {
        expect(() => isAlphaNumerical('test!')).toThrow('Non-alphanumeric characters not allowed');
    });
})

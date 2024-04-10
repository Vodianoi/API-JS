import request from 'supertest';
import routes from '../routes/routes';
import express from "express";

const app = express();
import fs from "fs";
import * as path from "node:path";

const __driveroot = "/tmp/drive"

app.use(express.urlencoded({extended: false}));
routes(app)


/**
 * Test the default route of the app (/tmp/drive)
 * Add a file to the system, test if the file is present in the response
 * Add a folder to the system, test if the folder is present in the response
 * Add a file and a folder to the system, test if both are present in the response
 *
 */
describe('GET /api/drive', () => {

    it('should responds with status 200', async () => {
        const response = await request(app).get('/api/drive');
        expect(response.status).toBe(200);
    });
});

describe('GET /api/drive/{name} ', () => {
    /**
     * Test adding a folder to the system and then fetching it
     */
    it('should responds with status 200', async () => {
        const dirPath = path.join(__driveroot, 'testFolder');
        if (!fs.existsSync(dirPath))
            fs.mkdirSync(dirPath, {recursive: true})
        const response = await request(app).get('/api/drive/testFolder');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    /**
     * Test adding a file to the system and then fetching it
     */
    it('should responds with status 200', async () => {
        const filePath = path.join(__driveroot, 'testFile.txt');
        fs.writeFileSync(filePath, 'Hello World')
        const response = await request(app).get('/api/drive/testFile.txt');
        expect(response.status).toBe(200);
        expect(response.text).toEqual("Hello World");
    });

    /**
     * Test adding folder + file inside it
     */
    it('should responds with status 200', async() => {
        const dirPath = path.join(__driveroot, 'testFolder');
        if (!fs.existsSync(dirPath))
            fs.mkdirSync(dirPath, {recursive: true})
        const filePath = path.join(dirPath, 'testFile.txt');
        fs.writeFileSync(filePath, 'Hello World')
        const response = await request(app).get('/api/drive/testFolder');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{name: 'testFile.txt', isFolder: false, size: 11}]);
    });

    it('should responds with status 404' , async () => {
        const response = await request(app).get('/api/drive/unknown');
        expect(response.status).toBe(404);
    });

    function cleanup() {
        return () => {
            fs.rmSync(path.join(__driveroot, 'testFolder'), {recursive: true})
            fs.rmSync(path.join(__driveroot, 'testFile.txt'))
        };
    }

    // cleanup
    afterAll(cleanup());

});

describe('POST /api/drive?name={name}', () => {
    it('should responds with status 201', async () => {
        const response = await request(app).post('/api/drive?name=testFolder');
        expect(response.status).toBe(201);
    });

    it('should responds with status 400', async () => {
        const response = await request(app).post('/api/drive?name=test@-*Folder');
        expect(response.status).toBe(400);
    });

    it('should responds with status 201', async () => {
        const response = await request(app).put('/api/drive?name=testFile.txt').send('Hello World');
        expect(response.status).toBe(201);
    });

    // it('should responds with status 201', async () => {
    //     const response = await request(app).post('/api/drive/testFolder?name=testFile.txt').send('Hello World');
    //     expect(response.status).toBe(201);
    // });

    it('should responds with status 400', async () => {
        const response = await request(app).post('/api/drive?name=testFolder');
        expect(response.status).toBe(400);
    });

    // it('should responds with status 400', async () => {
    //     const response = await request(app).post('/api/drive/testFolder?name=testFile.txt').send('Hello World');
    //     expect(response.status).toBe(400);
    // });

    function cleanup() {
        return () => {
            fs.rmSync(path.join(__driveroot, 'testFolder'), {recursive: true})
            // fs.unlinkSync(path.join(__driveroot, 'testFile.txt'))
        };
    }

    // cleanup
    afterAll(cleanup());
});
import request from 'supertest';
import {app} from '../server';
import fs from "fs";
import path from "path";

const __driveRoot = "/tmp/drive"

/**
 * Retourne une liste contenant les dossiers et fichiers à la racine du “drive”
 */
describe('GET /api/drive', () => {

    it('should responds with status 200', async () => {
        const response = await request(app).get('/api/drive/');
        expect(response.status).toBe(200);
    });
});

/**
 * Retourne le contenu de {name} or file content
 */
describe('GET /api/drive/{name} ', () => {

    it('should responds with status 200', async () => {
        const dirPath = path.join(__driveRoot, 'testFolder');
        try {
            await fs.promises.access(dirPath)
        }catch (e) {
            await fs.promises.mkdir(dirPath)
        }
        const response = await request(app).get('/api/drive/testFolder');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('should responds with status 200', async () => {
        const filePath = path.join(__driveRoot, 'testFile.txt');
        await fs.promises.writeFile(filePath, 'Hello World')
        const response = await request(app).get('/api/drive/testFile.txt');
        expect(response.status).toBe(200);
        expect(response.text).toEqual("Hello World");
    });

    it('should responds with status 200', async () => {
        const dirPath = path.join(__driveRoot, 'testFolder');
        try {
            await fs.promises.access(dirPath)
        }catch (e) {
            await fs.promises.mkdir(dirPath)
        }

        const filePath = path.join(dirPath, 'testFile.txt');
        await fs.promises.writeFile(filePath, 'Hello World')
        const response = await request(app).get('/api/drive/testFolder');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{name: 'testFile.txt', isFolder: false, size: 11}]);
    });

    it('should responds with status 404', async () => {
        const response = await request(app).get('/api/drive/unknown');
        expect(response.status).toBe(404);
    });

    function cleanup() {
        return async () => {
            await fs.promises.rm(path.join(__driveRoot, 'testFolder'), {recursive: true})
            await fs.promises.rm(path.join(__driveRoot, 'testFile.txt'))
        };
    }

    // cleanup
    afterAll(cleanup());

});

/**
 * Créer un dossier avec le nom {name}
 */
describe('POST /api/drive?name={name}', () => {
    it('should responds with status 201', async () => {
        const response = await request(app).post('/api/drive?name=testFolder');
        expect(response.status).toBe(201);
    });

    it('should responds with status 400', async () => {
        const response = await request(app).post('/api/drive?name=test@-*Folder');
        expect(response.status).toBe(400);
    });


    it('should responds with status 400', async () => {
        const response = await request(app).post('/api/drive?name=testFolder');
        expect(response.status).toBe(400);
    });


    function cleanup() {
        return async () => {
            await fs.promises.rm(path.join(__driveRoot, 'testFolder'), {recursive: true})
        };
    }

    // cleanup
    afterAll(cleanup());
});

/**
 * Créer un dossier avec le nom {name} dans {folder}
 */
describe('POST /api/drive/{folder}?name={name}', () => {
    it('should responds with status 201', async () => {
        await request(app).post('/api/drive?name=testFolder');
        const response = await request(app).post('/api/drive/testFolder?name=testSubFolder');
        expect(response.status).toBe(201);
    });

    it('should responds with status 400', async () => {
        const response = await request(app).post('/api/drive/testFolder?name=test@-*SubFolder');
        expect(response.status).toBe(400);
    });

    it('should responds with status 400', async () => {
        const response = await request(app).post('/api/drive/testFolder?name=testSubFolder');
        expect(response.status).toBe(400);
    });

    it('should responds with status 404', async () => {
        const response = await request(app).post('/api/drive/unknown?name=testSubFolder');
        expect(response.status).toBe(404);
    });

    function cleanup() {
        return () => {
            fs.promises.rm(path.join(__driveRoot, 'testFolder'), {recursive: true})
        };
    }

    // cleanup
    afterAll(cleanup());
})

/**
 * Suppression d’un dossier ou d’un fichier avec le nom {name}
 */
describe('DELETE /api/drive/{name}', () => {

    it('should responds with status 201', async () => {
        const fileName = 'testFile.txt';
        const filePath = path.join(__driveRoot, fileName);
        await fs.promises.writeFile(filePath, 'Hello World')
        const response = await request(app).delete(`/api/drive/${fileName}`);
        expect(response.status).toBe(200);
    });

    it('should responds with status 400', async () => {
        const fileName = 'testFile@.txt';
        const filePath = path.join(__driveRoot, fileName);
        await fs.promises.writeFile(filePath, 'Hello World')
        const response = await request(app).delete(`/api/drive/${fileName}`);
        expect(response.status).toBe(400);
    });

    it('should responds with status 404', async () => {
        const response = await request(app).delete(`/api/drive/`);
        expect(response.status).toBe(404);
    });

    it('should responds with status 404', async () => {
        const response = await request(app).delete(`/api/drive/unknown`);
        expect(response.status).toBe(404);
    });

    function cleanup() {
        return async () => {
            await fs.promises.rm(path.join(__driveRoot, 'testFile@.txt'))
        };
    }

    // cleanup
    afterAll(cleanup());
})

/**
 * Suppression d’un dossier ou d’un fichier avec le nom {name} dans {folder}
 */
describe('DELETE /api/drive/{folder}/{name}', () => {

    it('should responds with status 201', async () => {
        const folderName = 'testFolder';
        const fileName = 'testFile.txt';
        const folderPath = path.join(__driveRoot, folderName);
        const filePath = path.join(folderPath, fileName);

        try{
            await fs.promises.access(folderPath)
        }catch (e) {
            await fs.promises.mkdir(folderPath)
        }


        await fs.promises.writeFile(filePath, 'Hello World')
        const response = await request(app).delete(`/api/drive/${folderName}/${fileName}`);
        expect(response.status).toBe(200);
    });

    it('should responds with status 400', async () => {
        const folderName = 'testFolder';
        const fileName = 'testFile@.txt';
        const folderPath = path.join(__driveRoot, folderName);
        const filePath = path.join(folderPath, fileName);
        try
        {
            await fs.promises.access(folderPath)
        } catch (e) {
            await fs.promises.mkdir(folderPath)
        }
        await fs.promises.writeFile(filePath, 'Hello World')
        const response = await request(app).delete(`/api/drive/${folderName}/${fileName}`);
        expect(response.status).toBe(400);
    });

    it('should responds with status 404', async () => {
        const response = await request(app).delete(`/api/drive/unknown/unknown`);
        expect(response.status).toBe(404);
    });

    function cleanup() {
        return async () => {
            await fs.promises.rm(path.join(__driveRoot, 'testFolder'), {recursive: true})
        };
    }

    // cleanup
    afterAll(cleanup());
});

/**
 * Créer un fichier à la racine du “drive”
 */
describe('PUT /api/drive', () => {

    it('should responds with status 201', async function () {
        const fileName = 'imageTest.webp';
        let filePath = `../../resources/${fileName}`;
        let fullPath = path.join(__dirname, filePath);

        const response = await request(app)
            .put('/api/drive')
            // .set('Content-Type', 'multipart/form-data')
            .attach('file', fullPath)

        expect(response.status).toBe(201);
    })

    it('should responds with status 400', async function () {
        const fileName = 'imageTest.webp';
        let filePath = `../../resources/${fileName}`;
        let fullPath = path.join(__dirname, filePath);

        const response = await request(app)
            .put('/api/drive')
            // .set('Content-Type', 'multipart/form-data')
            .attach('file', fullPath)

        expect(response.status).toBe(400);
    })



    function cleanup() {
        return async () => {
            await fs.promises.rm(path.join(__driveRoot, 'imageTest.webp'), {recursive: true})
        };
    }

    // cleanup
    afterAll(cleanup());

})

/**
 * Créer un fichier dans {folder}
 */
describe('PUT /api/drive/{folder}', () => {
    it('should responds with status 201', async function () {
        const fileName = 'imageTest.webp';
        let filePath = `../../resources/${fileName}`;
        let fullPath = path.join(__dirname, filePath);

        const folderName = 'testFolder';
        await request(app).post(`/api/drive?name=${folderName}`);
        const response = await request(app)
            .put(`/api/drive/${folderName}`)
            // .set('Content-Type', 'multipart/form-data')
            .attach('file', fullPath)

        expect(response.status).toBe(201);
    })

    it('should responds with status 400', async function () {
        const fileName = 'imageTest.webp';
        let filePath = `../../resources/${fileName}`;
        let fullPath = path.join(__dirname, filePath);

        const folderName = 'testFolder';
        const response = await request(app)
            .put(`/api/drive/${folderName}`)
            // .set('Content-Type', 'multipart/form-data')
            .attach('file', fullPath)

        expect(response.status).toBe(400);
    })

    it('should responds with status 404', async function () {
        const fileName = 'imageTest.webp';
        let filePath = `../../resources/${fileName}`;
        let fullPath = path.join(__dirname, filePath);

        const folderName = 'unknown';
        const response = await request(app)
            .put(`/api/drive/${folderName}`)
            // .set('Content-Type', 'multipart/form-data')
            .attach('file', fullPath)

        expect(response.status).toBe(404);
    })

    function cleanup() {
        return async () => {
            await fs.promises.rm(path.join(__driveRoot, 'testFolder'), {recursive: true})
        };
    }

    // cleanup
    afterAll(cleanup());
})

/**
 * Search feature
 */
describe('SEARCH /api/drive/?search=', () => {
    it('should responds with status 200', async () => {
        // add test files
        const folderName = 'testFolder';
        const fileName = 'testFile.txt';
        const folderPath = path.join(__driveRoot, folderName);
        const filePath = path.join(folderPath, fileName);

        try{
            await fs.promises.access(folderPath)
        }catch (e) {
            await fs.promises.mkdir(folderPath)
        }
        await fs.promises.writeFile(filePath, 'Hello World')

        const response = await request(app).get('/api/drive/?search=test');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            {
                name: path.join(__driveRoot, "testFolder"), isFolder: true, size: undefined
            },
            {
                name: path.join(__driveRoot, "testFolder", "testFile.txt"), isFolder: false, size: 11
            }
        ]);

    })

    function cleanup() {
        return async () => {
            await fs.promises.rm(path.join(__driveRoot, 'testFolder'), {recursive: true})
        };
    }

    // cleanup
    afterAll(cleanup());
})
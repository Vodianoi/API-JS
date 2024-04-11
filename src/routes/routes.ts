import { Express } from "express";
import { getFolder, postFolder, putFile, deleteFile } from "./app";

export default (app: Express) => {

    app.get('/api/drive', getFolder)

    app.get('/api/drive/*', getFolder)

    app.post('/api/drive/*/', postFolder)
    app.post('/api/drive', postFolder)

    app.put('/api/drive/*', putFile)
    app.put('/api/drive', putFile)

    app.delete('/api/drive/*/:name', deleteFile)
    app.delete('/api/drive/:name', deleteFile)
}
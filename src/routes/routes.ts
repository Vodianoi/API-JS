import { Express } from "express";
import { getDrive, getFolder, postFolder, postFile } from "./default";

export default (app: Express) => {

    app.get('/api/drive', getDrive)

    app.get('/api/drive/:name', getFolder)

    app.post('/api/drive', postFolder)

    app.put('/api/drive/:name', postFile)
    app.put('/api/drive', postFile)


}
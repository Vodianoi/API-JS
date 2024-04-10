import { Express } from "express";
import { getDrive, getFolder } from "./default";

export default (app: Express) => {

    app.get('/api/drive', getDrive)

    app.get('/api/drive/:name', getFolder)
}
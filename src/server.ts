import express from 'express'
import routes from './routes/routes'
import expressListRoutes from "express-list-routes";
import bb from "express-busboy";
import ErrorHandler from "./middlewares/ErrorHandles";


const app = express();


bb.extend(app, {
    upload: true,
    path: '/tmp/drive',
    allowedPath: /./
});

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});

app.use('/api/drive', routes)

app.use(ErrorHandler)

const port = 3000;

function start() {
    app.listen(port, () => {
        console.log(`Listening app on port ${port}`);
        expressListRoutes(app)
    })
}

export { start, app };
import express from 'express'
import routes from './routes/routes'
import expressListRoutes from "express-list-routes";
import bb from "express-busboy";


const app = express();


bb.extend(app, {
    upload: true,
    path: '/tmp/drive',
    allowedPath: /./
});


const port = 3000;

function start() {

    // app.get('/', function (req, res) {
    //     console.log('/ route : Hello world!')
    //     res.send('Hello World!')
    // });
    app.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader("Access-Control-Allow-Headers", "*");
        next();
    });
    routes(app)


    app.listen(port, () => {
        console.log(`Listening app on port ${port}`);
        expressListRoutes(app)
    })
}

export { start, app };
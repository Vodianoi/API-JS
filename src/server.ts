import express from 'express'
import routes from './routes/routes'
import expressListRoutes from "express-list-routes";

const app = express();
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
        console.log(expressListRoutes(app))
    })
}

export { start, app };
function start() {
    const express = require('express')
    const app = express();
    const port = 3000;

    app.get('/', function (req, res) {
        console.log('/ route : Hello world!')
        res.send('Hello World!')
    });

    app.listen(port, () => {
        console.log(`Listening app on port ${port}`);
    })
}

module.exports = {start}

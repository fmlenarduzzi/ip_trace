'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const config = require('../config/config');
const connectDb = require("../utils/connection");
const statistics = require('./statistics');
const apiCalls = require('./apiCalls');


// App
function main() {
    const app = express();
    app.use(bodyParser.json());

    // App Routes
    app.post('/traces', async (req, res) => {
        const p1 = apiCalls.getTraceInfo(req);
        const p2 = apiCalls.getRates();
        Promise.all([p1, p2]).then(async (responses) => {
            const result = apiCalls.makeResponse(responses[0], responses[1]);
            res.send(result);
            await statistics.updateStatics(result.name, result.distance_to_uy);
        });
    });

    app.get('/statistics', async (req, res) => {
        const result = await statistics.getStatics();
        res.send(result);
    });

    app.listen(config.appPort, config.appHost);
    console.log(`Running on https://${config.appHost}:${config.appPort}`);

    connectDb().then(() => {
        console.log("MongoDb connected");
    });
}
main();

// For unit testing purpose
exports.initServer = function () {
    main();
}
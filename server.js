'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('./config');
const currencySymbols = require('./symbols');


// App
const app = express();
app.use(bodyParser.json());


function getRates() {
    return axios.get(config.rates_conversion_url + config.api_key)
        .then((response) => {
            return response.data.rates;
        });
}

function getTraceInfo(req) {
    const traceIp = req.body.ip.toString();
    const trace_url = config.ip_trace_url.replace("YOUR_ADDRESS", traceIp);

    return axios.get(trace_url)
        .then((response) => {
            return response.data
        });
}

function prepareResponse(data, rates) {
    console.log(1, data);
    console.log(2, rates);
    const fromPrice = rates[config.base_currency];
    const toPrice = rates[data.currency];   // to = data.countryCode
    const conversionRate = toPrice / fromPrice;

    return {
        "ip": data.query,
        "name": data.country,
        "code": data.countryCode,
        "lat": data.lat,
        "lon": data.lon,
        "currencies": [
            {
                "iso": data.currency,
                "symbol": currencySymbols[data.currency],
                "conversion_rate": conversionRate
            }, {
                "iso": config.base_currency,
                "symbol": currencySymbols[config.base_currency],
                "conversion_rate": 1
            }
        ],
        "distance_to_uy": 0
    }
}

// App Routes
app.post('/traces', async (req, res) => {
    var p1 = getTraceInfo(req);
    var p2 = getRates();
    Promise.all([p1, p2]).then((values) => {
        const result = prepareResponse(values[0], values[1]);
        res.send(result);
    });
});

app.listen(config.app_port, config.app_host);
console.log(`Running on https://${config.app_host}:${config.app_port}`);
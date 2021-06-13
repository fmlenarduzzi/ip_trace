'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('./config');
const currencySymbols = require('./symbols');


// App
const app = express();
app.use(bodyParser.json());


async function getRates() {
    const response = await axios.get(config.rates_conversion_url + config.api_key);
    return response.data.rates;
}

async function prepareResponse(data) {

    // Calculate conversion rate
    let rates = await getRates();

    const fromPrice = rates[config.base_currency];
    const toPrice = rates[data.currency];   // to = data.countryCode
    const conversionRate = toPrice / fromPrice;

    return {
        "ip":data.query,
        "name": data.country,
        "code": data.countryCode,
        "lat": data.lat,
        "lon": data.lon,
        "currencies": [
            {
                "iso":data.currency,
                "symbol":  currencySymbols[data.currency],
                "conversion_rate": conversionRate
            }, {
                "iso": config.base_currency,
                "symbol":  currencySymbols[config.base_currency],
                "conversion_rate": 1
            }
        ],
        "distance_to_uy": 0
    }
}

// App Routes
app.post('/traces', async (req, res) => {
    const trace_url = config.ip_trace_url.replace("YOUR_ADDRESS", req.body.ip);
    axios.get(trace_url)
        .then(async response => {
            const result = await prepareResponse(response.data);
            res.send(result);
        })
        .catch(error => {
            console.log(error);
        });
});

app.listen(config.app_port, config.app_host);
console.log(`Running on https://${config.app_host}:${config.app_port}`);
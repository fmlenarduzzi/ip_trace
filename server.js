'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const currencySymbols = require('./symbols');


// Constants
const API_KEY = "ffcc344a3f31700c0020d166fd17ea96";
const PORT = 8080;
const HOST = '0.0.0.0';




// App
const app = express();
app.use(bodyParser.json());


async function getRates() {
    const response = await axios.get('http://data.fixer.io/api/latest?access_key=' + API_KEY);
    return response.data.rates;
}

async function prepareResponse(data) {

    // Calculate conversion rate
    let rates = await getRates();

    const fromPrice = rates["USD"];
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
                "iso": "USD",
                "symbol":  currencySymbols["USD"],
                "conversion_rate": 1
            }
        ],
        "distance_to_uy": 0
    }
}

// App Routes
app.post('/traces', async (req, res) => {
    axios.get('http://ip-api.com/json/' + req.body.ip + "?fields=8446431")
        .then(async response => {
            const result = await prepareResponse(response.data);
            res.send(result);
        })
        .catch(error => {
            console.log(error);
        });
});

app.listen(PORT, HOST);
console.log(`Running on https://${HOST}:${PORT}`);
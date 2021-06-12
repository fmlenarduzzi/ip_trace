'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');


// Constants
const API_KEY = "ffcc344a3f31700c0020d166fd17ea96";
const PORT = 8080;
const HOST = '0.0.0.0';

let countries = [];



// App
const app = express();
app.use(bodyParser.json());


async function getRates() {
    const response = await axios.get('http://data.fixer.io/api/latest?access_key=' + API_KEY);
    return response.data.rates;
}

function getCurrencySymbol(countryCode){
    const found = countries.find(element => element.CurrencyCode === countryCode);
    return found.CurrencySymbol;
}

async function prepareResponse(data) {

    // Calculate conversion rate
    let rates = await getRates();
    // console.log("Rates\n"+ JSON.stringify(rates));

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
            "symbol": getCurrencySymbol(data.currency),
            "conversion_rate": conversionRate
        }, {
            "iso": "USD",
            "symbol": getCurrencySymbol("USD"),
            "conversion_rate": 1
        }
    ],
        "distance_to_uy": 0
    }
}

// App Routes
app.post('/traces', async (req, res) => {
    if (countries.length === 0) {
        const response = await axios.get("http://countryapi.gear.host/v1/Country/getCountries");
        countries = response.data.Response;
    }
    axios.get('http://ip-api.com/json/' + req.body.ip + "?fields=8446431")
        .then(async response => {
            const result = await prepareResponse(response.data);
            // console.log(result);
            res.send(result);
        })
        .catch(error => {
            console.log(error);
        });
});

app.listen(PORT, HOST);
console.log(`Running on https://${HOST}:${PORT}`);
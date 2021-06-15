'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('../config/config');
const currencySymbols = require('../utils/symbols');
const connectDb = require("../utils/connection");
const Country = require('../models/Country');


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

function calculateDistance(dest) {
    const R = 6371.0710; // Radius of the Earth in kilometers
    const rlat1 = config.baseLatDeg * (Math.PI / 180); // Convert degrees to radians
    const rlat2 = dest.lat * (Math.PI / 180); // Convert degrees to radians
    const difflat = rlat2 - rlat1; // Radian difference (latitudes)
    const difflon = (dest.lon - config.baseLonDeg) * (Math.PI / 180); // Radian difference (longitudes)

    return 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
}

async function getStatics() {
    const longestDistance = await Country.findOne({}).sort({distance : -1}).limit(1);

    const group =
        { $group: {
                _id: "$hits",
                names: {
                    $push: {
                        $cond: [
                            { $eq: ["$hits", {$max: "$hits"}]},
                            "$name", ""
                        ]
                    }
                },
                count: {$sum: 1}}
        }
    const sort = {"$sort": {"_id":-1}}
    const limit= {"$limit": 1}
    const mostTraced = await Country.aggregate([group, sort, limit]);

    return {
        "longest_distance": {
            "country": longestDistance.name,
            "value": longestDistance.distance
        },
        "most_traced": {
            "country": mostTraced[0].names,
            "value": mostTraced[0]._id
        }
    };
}

async function updateStatics(country, distanceToUY) {
    const filter = { name: country };
    let update = {};
    const options = { upsert: true, new: true };
    let doc = await Country.findOne(filter);
    if (doc) {
        update = {$max: {'distance': distanceToUY}, $inc: {'hits': 1}};
        await Country.findOneAndUpdate(filter, update, options);
    } else {
        const newCountry = new Country({ name: country, distance: distanceToUY, hits: 1 });
        await newCountry.save().then(() => console.log(country + " country was created"));
    }
}

function prepareTraceResponse(data, rates) {
    const fromPrice = rates[config.base_currency];
    const toPrice = rates[data.currency];   // to = data.countryCode
    const conversionRate = toPrice / fromPrice;

    const distanceToUY = calculateDistance(data);

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
        "distance_to_uy": distanceToUY
    }
}

// App Routes
app.post('/traces', async (req, res) => {
    var p1 = getTraceInfo(req);
    var p2 = getRates();
    Promise.all([p1, p2]).then(async (responses) => {
        const result = prepareTraceResponse(responses[0], responses[1]);
        res.send(result);
        await updateStatics(result.name, result.distance_to_uy);
    });
});

app.get('/statistics', async (req, res) => {
    const result = await getStatics();
    res.send(result);
});

app.listen(config.app_port, config.app_host);
console.log(`Running on https://${config.app_host}:${config.app_port}`);

connectDb().then(() => {
    console.log("MongoDb connected");
});
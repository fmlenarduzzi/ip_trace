const axios = require('axios');
const config = require('../config/config');
const currencySymbols = require('../utils/symbols');
const { calculateDistance } = require('./statistics');


function getRates() {
    return axios.get(config.ratesConversionUrl + config.apiKey)
        .then((response) => {
            return response.data.rates;
        });
}

function getTraceInfo(req) {
    const traceIp = req.body.ip.toString();
    const trace_url = config.ipTraceUrl.replace("YOUR_ADDRESS", traceIp);

    return axios.get(trace_url)
        .then((response) => {
            return response.data
        });
}

function makeResponse(data, rates) {
    const fromPrice = rates[config.baseCurrency];
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
                "iso": config.baseCurrency,
                "symbol": currencySymbols[config.baseCurrency],
                "conversion_rate": 1
            }
        ],
        "distance_to_uy": distanceToUY
    };
}
module.exports = { getRates, getTraceInfo, makeResponse }
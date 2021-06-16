var config = {};

config.apiKey = "ffcc344a3f31700c0020d166fd17ea96";
config.appPort = 8080;
config.appHost = '0.0.0.0';

config.localConnection = "mongodb://localhost:27017/ipTraces";
config.dockerConnection = "mongodb://mongo:27017/ipTraces";

config.ratesConversionUrl = "http://data.fixer.io/api/latest?access_key=";
config.baseCurrency = "USD";

config.ipTraceUrl = "http://ip-api.com/json/YOUR_ADDRESS?fields=8446431";

// UY coords
config.baseLatDeg = -34.8576;
config.baseLonDeg = -56.1702;

module.exports = config;
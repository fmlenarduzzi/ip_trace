var config = {};

config.api_key = "ffcc344a3f31700c0020d166fd17ea96";
config.app_port = 8080;
config.app_host = '0.0.0.0';

config.localConnection = "mongodb://localhost:27017/ipTraces";
config.dockerConnection = "mongodb://mongo:27017/ipTraces";

config.rates_conversion_url = "http://data.fixer.io/api/latest?access_key=";
config.base_currency = "USD";

config.ip_trace_url = "http://ip-api.com/json/YOUR_ADDRESS?fields=8446431";

// UY coords
config.baseLatDeg = -34.8576;
config.baseLonDeg = 56.1702;

module.exports = config;
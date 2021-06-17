const mongoose = require("mongoose");
const config = require('../config/config');

const connection = config.dockerConnection;
const connectDb = () => {
    return mongoose.connect(connection);
};
module.exports = connectDb;
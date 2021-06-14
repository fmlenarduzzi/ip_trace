const { Schema, model } = require('mongoose');
const countrySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    hits: {
        type: Number,
        required: true
    }
});

countrySchema.index({ name: 1}, {
    unique: true,
});

module.exports = model("Country", countrySchema);
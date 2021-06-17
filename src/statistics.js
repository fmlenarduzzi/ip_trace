const config = require('../config/config');
const Country = require('../models/Country');


export function calculateDistance(dest) {
    const R = 6371.0710;                                                // Radius of the Earth in kilometers
    const rlat1 = config.baseLatDeg * (Math.PI / 180);                  // Convert degrees to radians
    const rlat2 = dest.lat * (Math.PI / 180);                           // Convert degrees to radians
    const difflat = rlat2 - rlat1;                                      // Radian difference (latitudes)
    const difflon = (dest.lon - config.baseLonDeg) * (Math.PI / 180);   // Radian difference (longitudes)

    return 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
}

export async function getStatics() {
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

export async function updateStatics(country, distanceToUY) {
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
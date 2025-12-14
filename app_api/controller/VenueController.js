var mongoose = require('mongoose');
var Venue = mongoose.model("venue");

const createResponse = function (res, status, content) {
    res.status(status).json(content);
}

var converter = (function () {
    var earthRadius = 6371; // km
    var radian2Kilometer = function (radian) {
        return parseFloat(radian * earthRadius);
    };
    var kilometer2Radian = function (distance) {
        return parseFloat(distance / earthRadius);
    };
    return {
        radian2Kilometer, kilometer2Radian,
    }
})();

const listVenues = async function (req, res) {
    try {
        const venues = await Venue.find({});
        createResponse(res, 200, venues);
    } catch (error) {
        createResponse(res, 500, { error: error.message });
    }
};

const addVenue = async function (req, res) {
    try {
        // Create venue with CORRECT format for YOUR schema
        const venueData = {
            name: req.body.name,
            address: req.body.address,
            rating: req.body.rating || 0,
            foodanddrink: req.body.foodanddrink || [],
            // YOUR SCHEMA: simple array [long, lat]
            coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)]
        };
        
        const newVenue = new Venue(venueData);
        await newVenue.save();
        
        createResponse(res, 201, newVenue);
    } catch (error) {
        createResponse(res, 400, { error: error.message });
    }
}

const getVenue = async function (req, res) {
    try {
        const venue = await Venue.findById(req.params.venueid);
        if (!venue) {
            return createResponse(res, 404, { status: "Mekan bulunamadı" });
        }
        createResponse(res, 200, venue);
    } catch (error) {
        createResponse(res, 400, { error: "Geçersiz ID" });
    }
}

const updateVenue = async function (req, res) {
    try {
        const updatedVenue = await Venue.findByIdAndUpdate(
            req.params.venueid,
            {
                ...req.body,
                coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)],
                hours: [
                    {
                        days: req.body.day1,
                        open: req.body.open1,
                        close: req.body.close1,
                        isClosed: req.body.isClosed1
                    },  // <-- Fixed: was )
                    {
                        days: req.body.day2,
                        open: req.body.open2,
                        close: req.body.close2,
                        isClosed: req.body.isClosed2
                    }   // <-- Fixed: missing closing }
                ]
            },
            { new: true }
        );

        if (!updatedVenue) {
            return createResponse(res, 404, { status: "Mekan bulunamadı" });
        }
        
        createResponse(res, 200, updatedVenue);  // Fixed: 200 not 201
    } catch (error) {
        createResponse(res, 400, { status: "Güncelleme başarısız", error: error.message });
    }
};

const deleteVenue = async function (req, res) {
    try {
        const deletedVenue = await Venue.findByIdAndDelete(req.params.venueid);
        
        if (!deletedVenue) {
            return createResponse(res, 404, { status: "Mekan bulunamadı" });
        }
        
        createResponse(res, 200, { 
            status: deletedVenue.name + " isimli mekan silindi" 
        });
    } catch (error) {
        createResponse(res, 400, { error: error.message });
    }
}

module.exports = {
    listVenues,
    addVenue,
    getVenue,
    updateVenue,
    deleteVenue
}
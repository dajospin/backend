var mongoose = require('mongoose');
var Venue = mongoose.model("venue");

const createResponse = function (res, status, content) {
    res.status(status).json(content);
}

var calculateLastRating = function(incomingVenue, isDeleted){
    var i,
    numComments,
    avgRating,
    sumRating = 0;
    var numComments = incomingVenue.comments.length;

    if (incomingVenue.comments){
        if(incomingVenue.comments.length == 0 && isDeleted)
        {
            avgRating = 0;
        } 
        else{
            for (i = 0; i < numComments; i++){
                sumRating = sumRating + incomingVenue.comments[i].rating;
            }
            avgRating = Math.ceil(sumRating / numComments);
        }
        incomingVenue.rating = avgRating;
        incomingVenue.save();
    }
};

var updateRating = function(venueid, isDeleted){
    Venue.findById(venueid)
    .select("rating comments")
    .exec()
    .then(function(venue){
        calculateLastRating(venue, isDeleted);
    });
};

var createComment = function(req, res, incomingVenue){
    try {
        // Create a properly formatted comment object
        const newComment = {
            rating: req.body.rating,
            author: req.body.author,
            text: req.body.text || ""
        };

        // Validate required fields
        if (!newComment.rating || !newComment.author) {
            return createResponse(res, 400, {
                status: "error",
                message: "Rating and author are required fields"
            });
        }

        incomingVenue.comments.push(newComment);
        incomingVenue.save().then(function(venue){
            var comments = venue.comments;
            var comment = comments[comments.length - 1];
            updateRating(venue._id, false);
            createResponse(res, 200, comment);
        }).catch(function(error){
            createResponse(res, 400, {
                status: "error",
                message: error.message
            });
        });
        
    } catch (error) {
        createResponse(res, 400, error);
    }
};

const addComment = async function (req, res) {
    try {
        await Venue.findById(req.params.venueid)
            .select("comments")
            .exec()
            .then((incomingVenue) => {
                if (!incomingVenue) {
                    return createResponse(res, 404, { status: "Mekan bulunamadı" });
                }
                createComment(req, res, incomingVenue);
            });
    } catch(error) {
        createResponse(res, 400, { status: "Yorum ekleme başarısız", error: error.message });
    }
};

const getComment = async function (req, res) {
    try {
        await Venue.findById(req.params.venueid).select("name comments").exec().then(function (venue) {
            
            var response, comment;
            if (!venue) {
                createResponse(res, 404, "Mekanid yanlış");
            } else if (venue.comments && venue.comments.id(req.params.commentid)) {
                comment = venue.comments.id(req.params.commentid);
              
                response = {
                    venue: {   
                        name: venue.name,
                        id: req.params.venueid,
                    },
                    comment: comment
                };
                createResponse(res, 200, response);
            } else {
                createResponse(res, 404, "Yorum id yanlış");
            }
        });
    } catch (error) {
        createResponse(res, 404, "Mekan bulunamadı");
    }
};

const updateComment = async function (req, res) {
    try {
        await Venue.findById(req.params.venueid)
            .select("comments")
            .exec()
            .then(function (venue) {
                let comment = venue.comments.id(req.params.commentid);
                comment.set(req.body);
                venue.save().then(function () {
                    updateRating(req.params.venueid, false);
                    createResponse(res, 201, comment);
                });
            });
    } catch (error) {
        createResponse(res, 400, error);
    }
};

const deleteComment = async function (req, res) {
    try {
        await Venue.findById(req.params.venueid)
            .select("comments")
            .exec()
            .then(function (venue) {
                try {
                    let comment = venue.comments.id(req.params.commentid);
                    comment.deleteOne();
                    venue.save().then(function () {
                        updateRating(venue._id, true);
                        createResponse(res, 200, { 
                            status: comment.author + " isimli kisinin yorumu silindi" 
                        });
                    });
                } catch (error) {
                    createResponse(res, 400, error);
                }
            });
    } catch (error) {
        createResponse(res, 400, error);
    }
};

module.exports = {
    addComment,
    getComment,
    updateComment,
    deleteComment
};
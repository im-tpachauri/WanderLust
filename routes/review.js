const express=require("express");
//const { model } = require("mongoose");
const reviewrouter = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError.js");
const wrapasync = require("../utils/wrapasync.js");
const listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const { listingSchema, reviewSchema } = require("../schema.js");





//validate reviews
const validateReview = (req, res, next) => {
    console.log("Received req.body:", req.body); // Debugging

    if (!req.body.review) {
        throw new ExpressError(400, "Review data is missing"); // Handle missing data
    }

    //     let { error } = reviewSchema.validate(req.body); // Validate req.body as a whole
    //     console.log("Received req.body:", req.body); // Debugging
    // console.log("Validation Error:", error); // Debugging

    // if (error) {
    //     let errmsg = error.details.map((el) => el.message).join(",");
    //     throw new ExpressError(400, errmsg);
    // } else {
    //     next();
    // }
    next();
};

//review post route
reviewrouter.post("/", validateReview, wrapasync(async (req, res) => {
    console.log(req.params.id);
    let currlisting = await listing.findById(req.params.id);
    console.log(req.body.review);  // Log request body to check if 'comments' exists
    let newreview = new Review(req.body.review);
    currlisting.reviews.push(newreview);
    await newreview.save();
    await currlisting.save();
    let { id } = req.params;
    console.log("new review saved");
    res.redirect(`/listings/${id}`);
}));


//delete review
reviewrouter.delete("/:reviewId", wrapasync(async (req, res) => {
    let { id, reviewId } = req.params;
    await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    console.log(`review with id ${reviewId} is deleted`);
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));
reviewrouter.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    console.error(err.stack);  // For debugging purposes
    res.status(statusCode).render("listings/error.ejs", { err: { statusCode, message } });
});

module.exports=reviewrouter;
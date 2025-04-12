
const express=require("express");
const router=express.Router();
const wrapasync = require("../utils/wrapasync.js");
const listing = require("../models/listing.js");
const expresserror = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");



//all listings route
router.get("/", wrapasync(async (req, res) => {
    const allListing = await listing.find({});
    res.render("listings/index.ejs", { allListing });
}));


// new route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//accept req on new route
router.post("/", wrapasync(async (req, res, next) => {
    // let{title,discription,image,price,country,location}=req.body;
    if (!req.body.listing) {
        throw new expresserror(400, "Send valid data for listing");
    }
    const newlisting = new listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");


}));

//update route
router.put("/:id", wrapasync(async (req, res) => {

    let { id } = req.params;
    await listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
})
);

//delete route
router.delete("/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    let deleted = await listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
}));


//individual listing display
router.get("/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    const element = await listing.findById(id).populate("reviews");
    //console.log(element);
    res.render("listings/individual.ejs", { element });
}));


//edit route
router.get("/:id/edit", wrapasync(async (req, res) => {
    let { id } = req.params;
    const element = await listing.findById(id);
    res.render("listings/edit.ejs", { element });
}));


module.exports=router;  
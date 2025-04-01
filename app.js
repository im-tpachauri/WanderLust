const express = require("express");
const app = express();
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const ejsmate = require("ejs-mate");
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "public")));
const expresserror=require("./utils/ExpressError.js");
const wrapasync=require("./utils/wrapasync.js");
const Review = require("./models/reviews.js");
const {listingSchema,reviewSchema}=require("./schema.js");

//mongoose setup
const mongoose = require('mongoose');
const ExpressError = require("./utils/ExpressError.js");



//home route
app.get("/", (req, res) => {
    res.send("this is root");
});

//validate listings
// const validateListings=(req,res,next)=>{
//     let{error}=listingSchema.validate(req.body);
//     if(error)
//     {
//         let errmsg=error.details.map((el)=>el.message).join(",");
//         throw new ExpressError(400,errmsg);
//     }
//     else{
//         next();
//     }
//     };




main()
    .then(() => {
        console.log("connected to database");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));


//all listings route
app.get("/listings", wrapasync(async (req, res) => {
    const allListing = await listing.find({});
    res.render("listings/index.ejs", { allListing });
}));


// new route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});


//accept req on new route
app.post("/listings", wrapasync(async (req, res, next) => {
    // let{title,discription,image,price,country,location}=req.body;
    if(!req.body.listing){
        throw new expresserror(400,"Send valid data for listing"); 
    }
        const newlisting = new listing(req.body.listing);
        await newlisting.save();
        res.redirect("/listings");


}));

//update route
app.put("/listings/:id", wrapasync(async (req, res) => {

    let { id } = req.params;
    await listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
})
);


//delete route
app.delete("/listings/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    let deleted = await listing.findByIdAndDelete(id);
    console.log(deleted);
    res.redirect("/listings");
}));





//individual listing display
app.get("/listings/:id",wrapasync( async (req, res) => {
    let { id } = req.params;
    const element = await listing.findById(id).populate("reviews");
    console.log(element);
    res.render("listings/individual.ejs", { element });
}));


//edit route

app.get("/listings/:id/edit",wrapasync( async (req, res) => {
    let { id } = req.params;
    const element = await listing.findById(id);
    res.render("listings/edit.ejs", { element });
}));


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
app.post("/listings/:id/reviews",validateReview,wrapasync(async(req,res)=>{
    let currlisting=await listing.findById(req.params.id);
    console.log(req.body.review);  // Log request body to check if 'comments' exists

    let newreview=new Review(req.body.review);

    currlisting.reviews.push(newreview);
    await newreview.save();
    await currlisting.save();
    let { id } = req.params;
    console.log("new review saved");
    res.redirect(`/listings/${id}`);
}));

//error
// app.all("*",(req,res,next)=>{
//     next(new expresserror(404,"Page nhi mila"));
// });


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    console.error(err.stack);  // For debugging purposes
    res.status(statusCode).render("listings/error.ejs", { err: { statusCode, message } });
});


app.listen("3000", () => {
    console.log("server is listening");
})

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const ejsmate = require("ejs-mate");
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "public")));
const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");

//mongoose setup
const mongoose = require('mongoose');
const ExpressError = require("./utils/ExpressError.js");



//home route
app.get("/", (req, res) => {
    res.send("this is root");
});


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

app.use("/listings",listings);//listings route
app.use("/listings/:id/reviews",reviews);//review route


//error handeling
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});


app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    console.error(err.stack);  // For debugging purposes
    res.status(statusCode).render("listings/error.ejs", { err: { statusCode, message } });
});


app.listen("3000", () => {
    console.log("server is listening");
})

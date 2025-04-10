const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose'); 
const ejs = require('ejs');
const Listing = require('./models/listing.js');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const wrapAsync = require("./utils/wrapAsync.js")
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const ExpressError= require("./utils/ExpressError.js")
const {listingSchema,reviewSchema}= require("./schema.js")
const Review= require('./models/review.js');


// Connect to MongoDB
async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");
}
main().catch(err => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"public")));
app.get('/', (req, res) => {
    res.send('Hello World');
});

const validateListing = (req,res,next)=>{
    let {error}= listingSchema.validate(req.body)
 if(error)
 {
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
 } 
 else{
    next();
 }
};

const validateReview = (req,res,next)=>{
    let {error}= reviewSchema.validate(req.body)
 if(error)
 {
    let errMsg = error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
 } 
 else{
    next();
 }
};







// Show all listings
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// Show form to create a new listing
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Show a single listing
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

// Create a new listing
app.post("/listings",validateListing, wrapAsync(async(req, res,next) => {

  
    const newListing = new Listing(req.body.listing);

    await newListing.save();
    res.redirect("/listings");
})
);

// Show edit form for a listing
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// Update a listing
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
    if(!req.body.listing){
        throw new ExpressError(400,"Send valid Data For Listing")
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`); // Corrected redirect syntax
}));

// Delete a listing
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleteListing =await Listing.findByIdAndDelete(id);
    console.log(deleteListing)
    res.redirect("/listings");
}));

app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
   let listing=await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

   await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`)
}));



//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{pull:{reviews:reviewId}})
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))






app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page NOt Found"))
})


app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something Went Wrong"}=err
    res.status(statusCode).render("error.ejs",{message})
  //  res.status(statusCode).send(message)
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
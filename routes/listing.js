const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const {listingSchema}= require("../schema.js")
const ExpressError= require("../utils/ExpressError.js")
const Listing = require('../models/listing.js');
const {isLoggedIn} = require("../middleware.js")
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

// Show all listings
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// Show form to create a new listing
router.get("/new", isLoggedIn,(req, res) => {
   
    res.render("listings/new.ejs");
});

// Show a single listing
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
        req.flash("error","Listing You Requested for does not exist");
        res.redirect("/listings");
    }
    console.log(listing)
    res.render("listings/show.ejs", { listing });
}));

// Create a new listing
router.post("/",validateListing,isLoggedIn, wrapAsync(async(req, res,next) => {

  
    const newListing = new Listing(req.body.listing);
    
    newListing.owner =  req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created");
    res.redirect("/listings");
})
);

// Show edit form for a listing
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing You Requested for does not exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));    

// Update a listing 
router.put("/:id",validateListing,isLoggedIn, wrapAsync(async (req, res) => {
    
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","Ypu dont have permession To Edit");
       return  res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`); // Corrected redirect syntax
}));

// Delete a listing
router.delete("/:id", isLoggedIn,wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleteListing =await Listing.findByIdAndDelete(id);
    console.log(deleteListing)
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}));

module.exports = router;
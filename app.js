const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose'); 
const ejs = require('ejs');

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const ExpressError= require("./utils/ExpressError.js")


const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");


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

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


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
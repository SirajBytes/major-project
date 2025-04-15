const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose'); 
const ejs = require('ejs');

const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate")
const session = require("express-session");
const flash = require("connect-flash");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const ExpressError= require("./utils/ExpressError.js")
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js")

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


const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 1000,
        maxAge:7 * 24 * 60 * 1000,
        httpOnly:true, //cross scripting attacks
    }

};

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next()
})

// app.get("/demouser",async (req,res)=>{
//     let fakeUser = new User({
//         email:"Student@gmail.com",
//         username:"sigma-student"
//     });

//   let registeredUser= await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// })








app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter)


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
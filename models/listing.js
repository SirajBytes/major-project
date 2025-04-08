const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const listingSchema = new Schema({
   title:{
    type:String,
    required:true,
     },
     description:String,
    //  image:{
    //     type:String,
    //     default: "https://unsplash.com/photos/ferns-in-the-sunlit-forest-look-vibrant-HZksGaLPJA4",
    //     set: (v) => 
    //         v === ""
    //      ? "https://unsplash.com/photos/ferns-in-the-sunlit-forest-look-vibrant-HZksGaLPJA4" : v
    //  },
    image:{
        filename:String,
        url:{
            type:String,
            default:"https:unsplash.com/photos/ferns-in-the-sunlit-forest-look-vibrant-HZksGaLPJA4"
        }
    },
     price:Number,
     location:String,
     country:String,
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;

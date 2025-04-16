const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Review = require("./review.js")

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
     reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
     ],
     owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
     }
});


listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing)
    {
        await Review.deleteMany({_id:{$in:listing.reviews}});
    }
    
})

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;

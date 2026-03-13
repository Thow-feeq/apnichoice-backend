import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  review: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    default: 5
  },

  image: {
    type: String
  }

}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
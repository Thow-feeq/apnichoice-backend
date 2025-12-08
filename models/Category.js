import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    slug: {
      type: String,
      required: true,
      unique: true
    },

    image: {
      type: String,
      default: ""
    },

    bgColor: {
      type: String,
      default: "#f0f0f0"
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },

    level: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);

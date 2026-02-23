import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      trim: true
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
    },

    path: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

/* 🔥 Compound Unique Index */
categorySchema.index({ slug: 1, parent: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
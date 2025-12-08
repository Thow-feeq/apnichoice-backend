import mongoose from "mongoose";

/* ✅ SIZE SCHEMA */
const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    enum: ["S", "M", "L", "XL", "XXL", "XXXL"],
    required: true,
  },
  quantity: { type: Number, default: 0 },
});

/* ✅ COLOR / VARIANT SCHEMA */
const colorSchema = new mongoose.Schema({
  colorName: { type: String, required: true },
  colorCode: { type: String },
  pattern: { type: String },
  images: [{ type: String }], // variant images (urls)
  sizes: [sizeSchema],
});

/* ✅ MAIN PRODUCT SCHEMA */
const productSchema = new mongoose.Schema(
  {
    /* ✅ BASIC INFO */
    name: { type: String, required: true, trim: true },
    description: { type: [String], required: true },

    price: { type: Number, required: true },
    offerPrice: { type: Number },

    /* ✅ MAIN IMAGES */
    images: [{ type: String, required: true }],

    /* ✅ ✅ CATEGORY — FINAL CHILD ONLY */
    category: {
      type: String,             // ✅ child category slug (tshirt, kurtha…)
      required: true,
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId, // ✅ actual Category _id (for joins)
      ref: "Category",
      required: true,
    },

    /* ✅ SELLER */
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller",
    },

    /* ✅ VARIANTS */
    variants: [colorSchema],

    /* ✅ STOCK FLAG */
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ✅ PERFORMANCE INDEXES */
productSchema.index({ category: 1 });
productSchema.index({ name: 1 });

/* ✅ SAFE EXPORT */
const Product =
  mongoose.models.product || mongoose.model("product", productSchema);

export default Product;

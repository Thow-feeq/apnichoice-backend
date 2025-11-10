// server/models/Product.js
import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  size: { type: String, enum: ["S","M","L","XL","XXL","XXXL"], required: true },
  quantity: { type: Number, default: 0 },
});

const colorSchema = new mongoose.Schema({
  colorName: { type: String, required: true },
  colorCode: { type: String },
  pattern: { type: String },       // new
  images: [{ type: String }],      // variant images (urls)
  sizes: [sizeSchema],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: [String], required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number },

    images: [{ type: String, required: true }], // main images (urls)

    category: { type: String, required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: "seller" },

    variants: [colorSchema],
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = mongoose.models.product || mongoose.model("product", productSchema);
export default Product;

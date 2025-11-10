// server/controllers/productController.js
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Product from "../models/Product.js";

/**
 * POST /api/product/add
 * Expects multipart/form-data with:
 * - productData (stringified JSON) containing the product fields and for each variant an array placeholder for images (so backend knows count)
 * - images (main images) -> req.files.images
 * - variantImages (all variant images flattened in order) -> req.files.variantImages
 */
export const addProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.productData || "{}");

    // Files
    const mainImages = req.files?.images || [];
    const variantFiles = req.files?.variantImages || [];

    // 1. Upload main images
    const uploadedMain = await Promise.all(
      mainImages.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    // 2. Upload variant images (all at once)
    const uploadedVariantUrls = await Promise.all(
      variantFiles.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    // 3. Reconstruct images into each variant (3 images each)
    let pointer = 0;

    productData.variants = (productData.variants || []).map((variant) => {
      const expectedCount = 3; // you always expect 3 variant images from frontend

      const urls = uploadedVariantUrls.slice(pointer, pointer + expectedCount);
      pointer += expectedCount;

      return {
        colorName: variant.colorName,
        colorCode: variant.colorCode || "",
        pattern: variant.pattern || "",
        sizes: Array.isArray(variant.sizes) ? variant.sizes : [],
        images: urls, // array of URLs
      };
    });

    // 4. Create product
    const newProduct = await Product.create({
      ...productData,
      images: uploadedMain,
      seller_id: req.sellerId || null,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const productList = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const [products, totalCount] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, products, currentPage: Number(page), totalPages: Math.ceil(totalCount / limit), totalCount });
  } catch (err) {
    console.error("List Error:", err);
    res.status(500).json({ success: false, message: "Failed to list products" });
  }
};

export const productById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const updated = await Product.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const updated = await Product.findByIdAndUpdate(id, { inStock }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Stock updated", product: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

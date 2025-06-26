import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Product from "../models/Product.js";

// Add Product: POST /api/product/add
export const addProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.productData);
    const images = req.files;

    const imageUrls = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
        return result.secure_url;
      })
    );

    const newProduct = new Product({ ...productData, image: imageUrls });
    await newProduct.save();

    res.status(201).json({ success: true, message: "Product added", product: newProduct });
  } catch (error) {
    console.error("Add Product Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Product List: GET /api/product/list?page=1&limit=10&sellerId=abc123&search=watch
export const productList = async (req, res) => {
  try {
    const { page = 1, limit = 100, sellerId, search } = req.query;

    const escapeRegex = (text) =>
      text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    const filter = {};

    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
      filter.seller = new mongoose.Types.ObjectId(sellerId);
    }

    if (search) {
      const escapedSearch = escapeRegex(search);
      filter.name = { $regex: escapedSearch, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      products,
      currentPage: Number(page),
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error("List Products Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Product: GET /api/product/:id
export const productById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Change Stock: POST /api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const updated = await Product.findByIdAndUpdate(id, { inStock }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Stock updated", product: updated });
  } catch (error) {
    console.error("Change Stock Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Product: PUT /api/product/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const { name, category, offerPrice, image, inStock } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category,
        offerPrice: Number(offerPrice),
        image,
        inStock,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Update Product Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Product: DELETE /api/product/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete Product Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Product Count: GET /api/product/count
export const getProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error("Get Product Count Error:", error.message);
    res.status(500).json({ success: false, message: 'Failed to get product count', error: error.message });
  }
};

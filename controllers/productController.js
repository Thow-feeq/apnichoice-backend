// server/controllers/productController.js
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js"; // ✅ IMPORTANT

/**
 * POST /api/product/add
 * Only allows adding product to a FINAL CHILD category ✅
 */
export const addProduct = async (req, res) => {
  try {
    const productData = JSON.parse(req.body.productData || "{}");

    const mainImages = req.files?.images || [];
    const variantFiles = req.files?.variantImages || [];

    // ✅ 1. STRICT CATEGORY VALIDATION (CHILD ONLY)
    if (!productData.category) {
      return res.status(400).json({
        success: false,
        message: "Final child category is required",
      });
    }

    // Find category by slug OR path
    const selectedCategory = await Category.findOne({
      $or: [
        { slug: productData.category },
        { path: productData.category },
      ],
    });

    if (!selectedCategory) {
      return res.status(400).json({
        success: false,
        message: "Invalid category selected",
      });
    }

    // ✅ CHECK: This category MUST NOT have children (leaf only)
    const hasChildren = await Category.exists({
      parent: selectedCategory._id,
    });

    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: "Product must be added to a CHILD category only",
      });
    }

    // ✅ 2. UPLOAD MAIN IMAGES
    const uploadedMain = await Promise.all(
      mainImages.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          chunk_size: 6_000_000,
          quality: "auto",
          fetch_format: "auto",
        });
        return result.secure_url;
      })
    );

    // ✅ 3. UPLOAD VARIANT IMAGES
    const uploadedVariantUrls = await Promise.all(
      variantFiles.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          chunk_size: 6_000_000,
          quality: "auto",
          fetch_format: "auto",
        });
        return result.secure_url;
      })
    );

    // ✅ 4. MAP VARIANT IMAGES CORRECTLY
    let pointer = 0;

    productData.variants = (productData.variants || []).map((variant) => {
      const expectedCount = Array.isArray(variant.images)
        ? variant.images.length
        : 0;

      const urls = uploadedVariantUrls.slice(
        pointer,
        pointer + expectedCount
      );

      pointer += expectedCount;

      return {
        colorName: variant.colorName,
        colorCode: variant.colorCode || "",
        pattern: variant.pattern || "",
        sizes: Array.isArray(variant.sizes) ? variant.sizes : [],
        images: urls,
      };
    });

    // ✅ 5. CREATE PRODUCT (ONLY CHILD CATEGORY STORED)
    const safeStock = Number(productData.stock || 0);
    const newProduct = await Product.create({
      ...productData,
      images: uploadedMain,
      category: selectedCategory.slug,      // ✅ child slug
      categoryId: selectedCategory._id,     // ✅ REQUIRED FIELD (THIS FIXES YOUR ERROR)
      seller_id: req.sellerId || null,
      stock: safeStock   // ✅ THIS IS THE FIX
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

// ✅ PRODUCT LIST (FILTERS WORK WITH CHILD CATEGORY SLUG)
export const productList = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const filter = {};

    if (category) filter.category = category; // child slug
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
    });
  } catch (err) {
    console.error("List Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to list products",
    });
  }
};

export const productById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid id" });

    const product = await Product.findById(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Not found" });

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({
        success: false,
        message: "Invalid product id"
      });

    const productData = JSON.parse(req.body.productData || "{}");

    const mainImages = req.files?.images || [];
    const variantFiles = req.files?.variantImages || [];

    /* ---------------- CATEGORY VALIDATION (OPTIONAL) ---------------- */

    let selectedCategory = null;

    if (productData.category) {

      selectedCategory = await Category.findOne({
        $or: [
          { slug: productData.category },
          { path: productData.category }
        ]
      });

      if (!selectedCategory) {
        return res.status(400).json({
          success: false,
          message: "Invalid category"
        });
      }

      const hasChildren = await Category.exists({
        parent: selectedCategory._id
      });

      if (hasChildren) {
        return res.status(400).json({
          success: false,
          message: "Select final child category"
        });
      }

    }

    /* ---------------- MAIN IMAGE UPLOAD ---------------- */

    let uploadedMain = [];

    if (mainImages.length) {

      uploadedMain = await Promise.all(
        mainImages.map(async (file) => {

          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "image",
            quality: "auto",
            fetch_format: "auto"
          });

          return result.secure_url;

        })
      );

    }

    /* ---------------- VARIANT IMAGE UPLOAD ---------------- */

    const uploadedVariantUrls = await Promise.all(
      variantFiles.map(async (file) => {

        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          quality: "auto",
          fetch_format: "auto"
        });

        return result.secure_url;

      })
    );

    let pointer = 0;

    productData.variants = (productData.variants || []).map((variant) => {

      // Count actual NEW images being uploaded
      const newImageCount = variant.newImageCount || 0;

      // Get new uploaded URLs for this variant
      const newUrls = uploadedVariantUrls.slice(pointer, pointer + newImageCount);
      pointer += newImageCount;

      // Merge existing images with new ones
      const existingUrls = Array.isArray(variant.existingImages) ? variant.existingImages : [];
      const finalImages = [...existingUrls, ...newUrls];

      return {
        colorName: variant.colorName || "Default",
        colorCode: variant.colorCode || "",
        pattern: variant.pattern || "",
        sizes: variant.sizes || [],
        images: finalImages
      };

    });

    /* ---------------- BUILD UPDATE OBJECT ---------------- */
    const safePrice = Number(productData.price);
    const safeOfferPrice = Number(productData.offerPrice);

    /* ---------------- BUILD UPDATE OBJECT ---------------- */

    const updateData = {};

    if (productData.name !== undefined)
      updateData.name = productData.name;

    if (productData.description !== undefined)
      updateData.description = Array.isArray(productData.description)
        ? productData.description
        : [productData.description];

    if (productData.price !== undefined) {
      const safePrice = Number(productData.price);
      updateData.price = isNaN(safePrice) ? 0 : safePrice;
    }

    if (productData.offerPrice !== undefined) {
      const safeOffer = Number(productData.offerPrice);
      updateData.offerPrice = isNaN(safeOffer) ? 0 : safeOffer;
    }

    updateData.variants = productData.variants || [];

    // Merge main images: existing + new
    if (uploadedMain.length || productData.existingMainImages?.length) {
      const existingMain = Array.isArray(productData.existingMainImages) ? productData.existingMainImages : [];
      updateData.images = [...existingMain, ...uploadedMain];
    }

    // Update category if provided
    if (productData.category) {
      updateData.category = productData.category;
    }

    // Update category if valid category was found
    if (selectedCategory) {
      updateData.category = selectedCategory.slug;
      updateData.categoryId = selectedCategory._id;
    } else if (productData.category) {
      // Keep existing category if no new valid category provided
      updateData.category = productData.category;
    }

    /* ---------------- UPDATE PRODUCT ---------------- */

    const updated = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updated
    });

  } catch (error) {

    console.error("Update Product Error:", error);

    res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message
    });

  }
};

export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false });

    product.inStock = inStock;

    if (!inStock) {
      // 🔴 OUT OF STOCK → SET ALL QTY = 0
      product.variants.forEach(v => {
        v.sizes.forEach(s => {
          s.quantity = 0;
        });
      });
    } else {
      // ✅ BACK IN STOCK → RESTORE MIN QTY = 1
      product.variants.forEach(v => {
        v.sizes.forEach(s => {
          if (s.quantity === 0) {
            s.quantity = 1;   // ✅ IMPORTANT FIX
          }
        });
      });
    }

    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid id" });

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Not found" });

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

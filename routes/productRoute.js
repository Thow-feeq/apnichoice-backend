// server/routes/productRoute.js
import express from "express";
import { upload } from "../configs/multer.js";
import authSeller from "../middlewares/authAdmin.js";
import {
  addProduct,
  productList,
  productById,
  updateProduct,
  deleteProduct,
  changeStock,
} from "../controllers/productController.js";
import Product from "../models/Product.js";

const router = express.Router();

// Add Product
router.post(
  "/add",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "variantImages", maxCount: 50 },
  ]),
  authSeller,
  addProduct
);

// Product List
router.get("/list", productList);

// ✅ Product Count (must come BEFORE /:id)
router.get("/count", async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get product by ID
router.get("/:id", productById);

// Update product
router.put("/:id", authSeller, updateProduct);

// Delete product
router.delete("/:id", authSeller, deleteProduct);

// Change stock
router.post("/stock", authSeller, changeStock);

export default router;

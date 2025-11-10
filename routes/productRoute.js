// server/routes/productRoute.js
import express from "express";
import { upload } from "../configs/multer.js"; // your multer config that defines upload.fields()
import authSeller from "../middlewares/authSeller.js";
import {
  addProduct,
  productList,
  productById,
  updateProduct,
  deleteProduct,
  changeStock,
} from "../controllers/productController.js";

const router = express.Router();

router.post(
  "/add",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "variantImages", maxCount: 50 },
  ]),
  authSeller,
  addProduct
);

router.get("/list", productList);
router.get("/:id", productById);
router.put("/:id", authSeller, updateProduct);
router.delete("/:id", authSeller, deleteProduct);
router.post("/stock", authSeller, changeStock);

export default router;

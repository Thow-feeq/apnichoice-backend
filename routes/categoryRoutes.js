import express from "express";
import {
  addCategory,
  getCategoryTree,
  deleteCategory,
  updateCategory,
  getCategoryCount,
  listCategories,
  getSingleCategory   // 👈 add this
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/add", addCategory);
router.get("/tree", getCategoryTree);

router.get("/count", getCategoryCount);

// 👇 VERY IMPORTANT: place BEFORE put/delete conflicts
router.get("/list", listCategories);
router.get("/:id", getSingleCategory);

router.delete("/delete/:id", deleteCategory);
router.put("/:id", updateCategory);

export default router;
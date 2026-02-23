import express from "express";
import {
  addCategory,
  getCategoryTree,
  deleteCategory,
  updateCategory,
  getSingleCategory   // 👈 add this
} from "../controllers/categoryController.js";

const router = express.Router();

router.post("/add", addCategory);
router.get("/tree", getCategoryTree);

// 👇 VERY IMPORTANT: place BEFORE put/delete conflicts
router.get("/:id", getSingleCategory);

router.delete("/delete/:id", deleteCategory);
router.put("/:id", updateCategory);

export default router;
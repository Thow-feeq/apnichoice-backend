import express from "express";
import {
  getCategoryCount,
  addCategory,
  listCategories,
  updateCategory,
  deleteCategory,
  getCategoryTree
} from "../controllers/categoryController.js";

const router = express.Router();

/* ============================
   CATEGORY STATS
============================ */
router.get("/count", getCategoryCount);

/* ============================
   CREATE CATEGORY (WITH PARENT)
============================ */
router.post("/add", addCategory);

/* ============================
   LIST (NORMAL FLAT LIST – ADMIN TABLE)
============================ */
router.get("/list", listCategories);

/* ============================
   TREE LIST (FOR CLIENT UI)
   → Multi-column selector
============================ */
router.get("/tree", getCategoryTree);

/* ============================
   UPDATE
============================ */
router.put("/edit/:id", updateCategory);

/* ============================
   DELETE
============================ */
router.delete("/delete/:id", deleteCategory);

export default router;

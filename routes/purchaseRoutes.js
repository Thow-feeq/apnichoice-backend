import express from "express";
import { createPurchase,getPurchases, deletePurchase  } from "../controllers/purchaseController.js";

const router = express.Router();

router.post("/purchase",createPurchase);
router.get("/purchase",getPurchases);
router.delete("/purchase/:id",deletePurchase);

export default router;
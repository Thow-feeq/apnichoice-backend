import express from "express";
import { addSupplier,getSuppliers,deleteSupplier } from "../controllers/supplierController.js";

const router = express.Router();

router.post("/supplier",addSupplier);
router.get("/supplier",getSuppliers);
router.delete("/supplier/:id",deleteSupplier);

export default router;
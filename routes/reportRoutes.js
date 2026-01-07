// routes/reportRoutes.js
import express from "express";
import { getSalesReport } from "../controllers/salesReportController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/sales", adminAuth, getSalesReport);

export default router;

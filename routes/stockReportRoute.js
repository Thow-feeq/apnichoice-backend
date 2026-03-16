import express from "express";
import { getStockReport } from "../controllers/stockReportController.js";

const router = express.Router();

router.get("/stock-report", getStockReport);

export default router;
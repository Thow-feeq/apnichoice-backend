import express from "express";
import upload from "../middlewares/upload.js";
import { createBanner, getBanners, deleteBanner } from "../controllers/bannerController.js";

const router = express.Router();

router.post("/admin/banner", upload.single("image"), createBanner);

router.get("/banner", getBanners);

router.delete("/admin/banner/:id", deleteBanner);

export default router;
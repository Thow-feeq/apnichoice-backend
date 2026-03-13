import express from "express";
import { getReviews, createReview, deleteReview } from "../controllers/reviewController.js";
import  upload  from "../middlewares/upload.js";

const router = express.Router();

router.get("/reviews", getReviews);
router.post("/reviews", upload.single("image"), createReview);
router.delete("/reviews/:id", deleteReview);

export default router;
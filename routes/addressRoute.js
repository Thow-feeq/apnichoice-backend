import express from "express";
import { addAddress, getAddress } from "../controllers/addressController.js";
import { authUser } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/add", authUser, addAddress);
router.get("/get", authUser, getAddress);

export default router;

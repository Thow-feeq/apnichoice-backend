import express from "express";
// import authUser from "../middlewares/authUser.js";
import userCookieAuth from "../middlewares/userCookieAuth.js";
import { updateCart } from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.post("/update", userCookieAuth, updateCart);

export default cartRouter;

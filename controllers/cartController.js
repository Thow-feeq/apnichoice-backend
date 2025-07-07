import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const updateCart = async (req, res) => {
  try {
    const { cartItems } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    req.user.cartItems = cartItems;
    await req.user.save();

    res.status(200).json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.error("Update Cart Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


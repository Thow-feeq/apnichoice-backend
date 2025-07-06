import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const updateCart = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { cartItems } = req.body;
    user.cartItems = cartItems;
    await user.save();

    res.status(200).json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.error("Update Cart Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

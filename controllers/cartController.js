import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const updateCart = async (req, res) => {
  try {
    // ✅ Step 1: Get token from cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized - No token" });
    }

    // ✅ Step 2: Decode token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Step 3: Update cart from body
    const { cartItems } = req.body;
    user.cartItems = cartItems;
    await user.save();

    res.status(200).json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log("Update Cart Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

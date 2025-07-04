import User from "../models/User.js";

// Update User Cart Data : POST /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const { userId, cartItems } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.cartItems = cartItems;
    await user.save();

    res.status(200).json({ success: true, message: "Cart Updated" });
  } catch (error) {
    console.log("Update Cart Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

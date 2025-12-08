import User from "../models/User.js";

// ✅ Update User Cart Data : POST /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { cartItems } = req.body;

    const user = await User.findById(userId);
    user.cartItems = cartItems;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


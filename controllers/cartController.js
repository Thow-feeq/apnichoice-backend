import User from "../models/User.js";

// ✅ Update User Cart Data : POST /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const userId = req.user._id;   // ✅ take from middleware
    const { cartItems } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { cartItems },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Cart Updated",
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.log("Update Cart Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

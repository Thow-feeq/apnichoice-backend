import Address from "../models/Address.js"


// Add Address : /api/address/add
// Add Address : /api/address/add
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;

    // ✅ Get userId from JWT middleware
    const userId = req.user.id || req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    await Address.create({ ...address, userId });

    res.json({
      success: true,
      message: "Address added successfully",
    });
  } catch (error) {
    console.log("Add address error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Address : /api/address/get
export const getAddress = async(req, res)=>{
    try {
        const { userId } = req.body
        const addresses = await Address.find({userId})
        res.json({success: true, addresses})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

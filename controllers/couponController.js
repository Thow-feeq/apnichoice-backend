import Coupon from '../models/Coupon.js';

// Create Coupon: POST /api/coupon/create
export const createCoupon = async (req, res) => {
  try {
    const { code, discountValue, discountType, minCartAmount, expiry } = req.body;

    // Check if the coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    // Create new coupon
    const coupon = new Coupon({
      code,
      discountValue,
      discountType,
      minCartAmount,
      expiry,
    });

    await coupon.save();

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get All Coupons: GET /api/coupon
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Apply Coupon: POST /api/coupon/apply
export const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code || !cartTotal) {
      return res.status(400).json({ success: false, message: 'Missing coupon code or cart total' });
    }

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (new Date(coupon.expiry) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (cartTotal < coupon.minCartAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart amount should be ₹${coupon.minCartAmount}`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = cartTotal * (coupon.discountValue / 100);
    } else {
      discountAmount = coupon.discountValue;
    }

    return res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      discountAmount,
      coupon,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const getCouponCount = async (req, res) => {
  try {
    const count = await Coupon.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get coupon count', error: error.message });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch coupons", error: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  }
};

// ✅ DELETE COUPON
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Delete failed', error: error.message });
  }
};

export const getPaginatedCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Ensure default is 5
    const skip = (page - 1) * limit;

    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCoupons = await Coupon.countDocuments();
    const totalPages = Math.ceil(totalCoupons / limit);

    res.json({
      success: true,
      coupons,
      totalPages,
      page,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch coupons", error: error.message });
  }
};
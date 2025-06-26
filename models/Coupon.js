import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountValue: { type: Number, required: true },
  discountType: { type: String, required: true }, // percentage or fixed amount
  minCartAmount: { type: Number, required: true },
  expiry: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;

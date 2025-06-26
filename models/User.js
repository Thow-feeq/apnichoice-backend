import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, unique: true, sparse: true },  // ✅ optional but unique
  password: { type: String, required: true },
  cartItems: { type: Object, default: {} },
  otp: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
});

const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User;

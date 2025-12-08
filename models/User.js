import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  cartItems: { type: Object, default: {} },

  // ✅ NEW FIELD
  status: { type: String, enum: ["active", "inactive"], default: "active" },

  otp: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },
});

const User = mongoose.models.user || mongoose.model("user", userSchema);
export default User;

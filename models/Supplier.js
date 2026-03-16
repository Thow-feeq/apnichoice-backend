import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  name: String,
  companyName: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  state: String
}, { timestamps: true });

export default mongoose.model("Supplier", supplierSchema);
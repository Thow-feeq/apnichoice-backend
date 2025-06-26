// src/models/Seller.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const sellerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

sellerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  // Hash the password before saving it
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Seller = mongoose.model('Seller', sellerSchema);
export default Seller;

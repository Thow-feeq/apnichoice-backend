import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = generateToken(user._id);
    res.status(201).json({ success: true, user, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.status(200).json({ success: true, user, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check Auth
export const isAuth = async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  res.status(200).json({ success: true, user: req.user });
};

// ✅ Logout User (frontend can simply clear localStorage)
export const logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out' });
};

// ✅ List Users (optional: add admin check if needed)
export const userList = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get User Count
export const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

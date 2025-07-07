import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// ✅ Register User : /api/user/register
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.json({ success: false, message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  // ✅ Set cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // ✅ Return token in response for mobile + frontend axios header
  res.json({
    success: true,
    user: { name, email, _id: user._id },
    token,
  });
};

// ✅ Login User : /api/user/login
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  // ✅ Set cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // ✅ Return token in response
  res.json({
    success: true,
    user: { name: user.name, email: user.email, _id: user._id },
    token,
  });
};

// ✅ Check Auth : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    // ✅ Accept token from cookie or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

// ✅ Logout User : /api/user/logout
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.json({ success: true, message: "Logged out" });
};

// Admin-only: List all users
export const userList = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("User List Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin-only: Get user count
export const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user count', error: error.message });
  }
};

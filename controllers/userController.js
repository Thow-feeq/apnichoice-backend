import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 🔐 Create JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ✅ Register User : POST /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: 'Missing Details' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = generateToken(user._id);

    // ✅ Optional: set cookie (for web), while still returning token in response
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Login User : POST /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Check Auth : GET /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    // ✅ Support cookie or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user)
      return res.status(401).json({ success: false, message: 'User not found' });

    return res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

// ✅ Logout User : GET /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// ✅ Get All Users (Admin) : GET /api/user/userList
export const userList = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("User List Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get User Count : GET /api/user/count
export const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user count',
      error: error.message
    });
  }
};

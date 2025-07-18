import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register User : /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: 'Missing Details' })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser)
      return res.json({ success: false, message: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({ name, email, password: hashedPassword })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,           // ✅ Required for cross-site cookie in HTTPS
      sameSite: "none",       // ✅ Allows sending cookie from different origin
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ success: true, token, user: { email: user.email, name: user.name } })
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// Login User : /api/user/login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({ success: false, message: 'Email and password are required' });
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch)
      return res.json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,           // ✅ Required for cross-site cookie in HTTPS
      sameSite: "none",       // ✅ Allows sending cookie from different origin
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ success: true, token, user: { email: user.email, name: user.name } })
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

// Admin: Get User List — GET /api/user/list
// Admin: Get User List — GET /api/user/list
export const userList = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // exclude password field
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("User List Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user count', error: error.message });
  }
};


// Check Auth : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
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


// Logout User : /api/user/logout

export const logout = async (req, res) => {
  try {
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,           // ✅ Required for cross-site cookie in HTTPS
      sameSite: "none",       // ✅ Allows sending cookie from different origin
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return res.json({ success: true, message: "Logged Out" })
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}
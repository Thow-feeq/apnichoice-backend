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

    res.cookie('token', token, {
      httpOnly: true, // Prevent JavaScript to access cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time
    })

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

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "Invalid email or password" });

    // ✅ BLOCK INACTIVE USERS
    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Contact admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


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
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({ success: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user)
      return res.status(401).json({ success: false, message: "User not found" });

    // ✅ BLOCK IF INACTIVE
    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Account deactivated by admin",
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Not authorized" });
  }
};


// Logout User : /api/user/logout

export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    return res.json({ success: true, message: "Logged Out" })
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
}

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res.json({
      success: true,
      message: `User ${user.status}`,
      status: user.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


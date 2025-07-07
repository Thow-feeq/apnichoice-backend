// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';
import User from '../models/User.js';

// ✅ For Seller: Token from Authorization Header (Bearer token)
export const isSellerAuthenticated = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const seller = await Seller.findById(decoded.id).select('-password');
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    req.seller = seller;
    next();
  } catch (error) {
    console.error('Seller Token verification error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ✅ For User: Token from Cookies (for browser sessions)
export const isUserAuthenticated = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('User Token verification error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

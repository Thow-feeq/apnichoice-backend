// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';

export const isSellerAuthenticated = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch seller from DB using decoded ID
    const seller = await Seller.findById(decoded.id).select('-password');
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    req.seller = seller; // Attach seller to request
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

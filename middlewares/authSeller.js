// authSeller.js
import jwt from 'jsonwebtoken';

const authSeller = async (req, res, next) => {
  let token = req.cookies.sellerToken;

  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized' });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      next();
    } else {
      return res.status(401).json({ success: false, message: 'Invalid seller' });
    }
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export default authSeller;

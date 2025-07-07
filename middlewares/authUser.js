// middlewares/authUser.js
import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  let token = req.cookies.token;

  // ✅ Fallback to Authorization header if cookie missing
  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id) {
      req.body.userId = decoded.id;
      next();
    } else {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default authUser;

// authUser.js
import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  let token = req.cookies.token;

  // ✅ If not in cookies, try Authorization header
  if (!token && req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized' });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id;
      next();
    } else {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export default authUser;

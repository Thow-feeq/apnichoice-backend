// authUser.js
import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    let token = null;

    // ✅ First: Get token from Authorization header
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ If no token found
    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized: No token" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid token structure" });
    }

    // ✅ Attach userId to req for controller usage
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    console.error("authUser error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authUser;

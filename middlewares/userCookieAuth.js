import jwt from "jsonwebtoken";
import User from "../models/User.js";

const userCookieAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.status === "inactive") {
      return res.status(403).json({ success: false, message: "Account inactive" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("User Cookie Auth Error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default userCookieAuth;

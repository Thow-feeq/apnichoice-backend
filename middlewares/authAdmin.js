import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not Authorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) return res.status(401).json({ success: false, message: 'Invalid Token' });
      next();
    });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export default authAdmin;

// server.js

import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import multer from 'multer';

import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';

import userRouter from './routes/userRoute.js';
import adminRouter from './routes/adminRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import couponRoutes from './routes/couponRoutes.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import newsletterRoutes from './routes/newsletterRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';
import paymentRoutes from './routes/paymentRoutes.js';


import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Stripe Webhook (must be before express.json())
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// Middleware
app.use(express.json()); // placed after Stripe raw body
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://apnichoice-frontend.vercel.app' // Replace with your actual frontend URL
  ],
  credentials: true,
}));

// Static files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads folder');
}
app.use('/uploads', express.static(uploadsDir));

// File Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});


// Routes
app.get('/', (req, res) => res.send('✅ API is working'));
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/coupon', couponRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/seller/category', categoryRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/payment', paymentRoutes);


// Server start
if (process.env.NODE_ENV !== 'test') {
  const initialize = async () => {
    await connectDB();
    await connectCloudinary();

    const testPhone = '6374540634';
    const testEmail = 'test@example.com';
    const testUser = await User.findOne({ $or: [{ phone: testPhone }, { email: testEmail }] });
    if (!testUser) {
      await User.create({
        name: 'Test User',
        phone: testPhone,
        email: testEmail,
        password: 'dummy123',
      });
      console.log('✅ Test user created');
    }

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  };

  initialize();
}

export default app;

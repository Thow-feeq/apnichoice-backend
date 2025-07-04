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
import sellerRouter from './routes/sellerRoute.js';
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

// ✅ Stripe Webhook (no JSON parsing here)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    'https://apnichoice-frontend.vercel.app',
    'http://localhost:5173',
  ],
  credentials: true,  // ✅ Must be true to allow cookies
}));

// ✅ Static Files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ✅ File Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// ✅ Routes
app.get('/', (req, res) => res.send('✅ API is working'));
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
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

// ✅ Start Server
if (process.env.NODE_ENV !== 'test') {
  const initialize = async () => {
    await connectDB();
    await connectCloudinary();

    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      await User.create({
        name: 'Test User',
        phone: '6374540634',
        email: 'test@example.com',
        password: 'dummy123',
      });
    }

    app.listen(port, () => console.log(`🚀 Server running on ${port}`));
  };

  initialize();
}

export default app;

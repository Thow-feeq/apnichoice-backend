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
import paymentRoutes from './routes/paymentRoutes.js';
import { stripeWebhooks } from './controllers/orderController.js';

import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// ------------------------
// Stripe Webhook (before express.json())
// ------------------------
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// ------------------------
// Middleware
// ------------------------
app.use(express.json());
app.use(cookieParser());

// ✅ CORS setup for cross-origin cookies
const allowedOrigins = [
  'http://localhost:5173',               // local frontend
  'http://localhost:3000',               // alt local
  'https://apnichoice-frontend.vercel.app' // production frontend
];

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://apnichoice-frontend.vercel.app"
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,

  // ✅ IMPORTANT: PATCH ADD PANNU
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
  ],
}));

// Debug CORS
// app.use((req, res, next) => {
//   console.log('Incoming request from origin:', req.headers.origin);
//   next();
// });

// ------------------------
// Uploads folder
// ------------------------
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ------------------------
// File upload
// ------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` });
});

// ------------------------
// API Routes
// ------------------------
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

// ------------------------
// Serve React frontend (after all API routes)
// ------------------------
// ------------------------
// Serve React frontend (ONLY in production)
// ------------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}


// ------------------------
// Start server
// ------------------------
if (process.env.NODE_ENV !== 'test') {
  const initialize = async () => {
    await connectDB();
    await connectCloudinary();

    // Create test user if not exists
    const testPhone = '6374540634';
    const testEmail = 'test@example.com';
    const testUser = await User.findOne({ $or: [{ phone: testPhone }, { email: testEmail }] });
    if (!testUser) {
      await User.create({ name: 'Test User', phone: testPhone, email: testEmail, password: 'dummy123' });
      console.log('✅ Test user created');
    }

    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  };

  initialize();
}

export default app;

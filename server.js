// server.js
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import connectDB from './configs/db.js';
import connectCloudinary from './configs/cloudinary.js';

import adminRouter from './routes/adminRoute.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// -------------------------
// MIDDLEWARE
// -------------------------
app.use(express.json()); // must be BEFORE routes
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://apnichoice-frontend.vercel.app'
  ],
  credentials: true,
}));

// -------------------------
// ROUTES
// -------------------------
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/category', categoryRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => res.send('✅ API is running'));

// -------------------------
// SERVE FRONTEND IN PRODUCTION
// -------------------------
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'frontend_dist'); // adjust if your build folder is different
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// -------------------------
// DATABASE & SERVER START
// -------------------------
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
  }
};

startServer();

export default app;

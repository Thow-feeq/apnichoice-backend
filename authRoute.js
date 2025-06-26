// src/server.js or app.js

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './authRoute.js'; // Import auth routes

dotenv.config();
const app = express();

app.use(express.json());  // To parse JSON bodies

// Use the login route
app.use('/api/auth', authRoutes);  // Add "/api/auth" to your login route

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log('MongoDB connection error:', err));

// routes/newsletterRoute.js
import express from 'express';
import Newsletter from '../models/Newsletter.js';

const router = express.Router();

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const exists = await Newsletter.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Already subscribed' });

    await Newsletter.create({ email });
    res.status(200).json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ GET: list all subscribers
router.get('/', async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add this below your POST /subscribe route
router.get('/count', async (req, res) => {
  try {
    const count = await Newsletter.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router;

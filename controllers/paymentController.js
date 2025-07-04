import Razorpay from 'razorpay';
import shortid from 'shortid';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: Math.round(amount), // Amount in paise
      currency: "INR",
      receipt: shortid.generate(),
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create Razorpay order", error: error.message });
  }
};

import User from '../models/User.js';
import generateOtp from '../utils/generateOtp.js';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  });
  console.log(`📧 OTP ${otp} sent to ${email}`);
};

const sendOtpSms = async (phone, otp) => {
  await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: process.env.TWILIO_PHONE,
    to: `+91${phone}`,
  });
  console.log(`📱 OTP ${otp} sent to ${phone}`);
};

export const sendOtp = async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ message: 'Phone or Email is required' });
  }

  try {
    let user = await User.findOne({ $or: [{ email }, { phone }] });

    if (!user) {
      user = await User.create({
        name: email?.split('@')[0] || 'New User',
        email,
        phone,
        password: 'otp-user',
      });
      console.log('👤 New user created:', user);
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiresAt = expiry;
    await user.save();

    if (email) await sendOtpEmail(email, otp);
    else if (phone) await sendOtpSms(phone, otp);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('❌ Error sending OTP:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, phone, otp } = req.body;

  if (!otp || (!email && !phone)) {
    return res.status(400).json({ message: 'OTP and email/phone are required' });
  }

  try {
    const user = await User.findOne({ $or: [{ email }, { phone }] });

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear OTP and save
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // JWT Payload and token
    const payload = { userId: user._id, email: user.email, name: user.name };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Optional: Set token cookie (secure option)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'OTP verified. Login successful.',
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


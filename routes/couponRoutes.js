import express from 'express';
import { createCoupon, getCoupons, applyCoupon, getCouponCount, getAllCoupons, getPaginatedCoupons, updateCoupon, deleteCoupon } from '../controllers/couponController.js';

const router = express.Router();

// Create coupon (Admin only)
router.post('/create', createCoupon);

// Get all coupons
router.get('/', getCoupons);

//Get Coupon Count
router.get('/count', getCouponCount);

// Apply coupon (Admin only)
router.post('/apply', applyCoupon);

//Admin-facing route
router.get('/list', getAllCoupons);

//Get Pagination for Coupon Lists
router.get('/list', getPaginatedCoupons);

// ✅ Update coupon
router.put('/update/:id', updateCoupon);

// ✅ Delete coupon
router.delete('/delete/:id', deleteCoupon);

export default router;

import express from 'express';
import authUser from '../middlewares/authUser.js';
import authSeller from '../middlewares/authAdmin.js';
import {
  getAllOrders,
  getUserOrders,
  placeOrderCOD,
  placeOrderOnline,
  placeOrderStripe,
  getOrderCount,
  updateOrderStatus
} from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD);          // COD
orderRouter.post('/online', authUser, placeOrderOnline);     // Online
orderRouter.post('/stripe', authUser, placeOrderStripe);     // Stripe Session

orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.get('/list', getAllOrders);
orderRouter.get('/count', getOrderCount);
orderRouter.put('/update-status', updateOrderStatus);

export default orderRouter;

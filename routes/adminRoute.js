import express from 'express';
import { adminLogin, adminLogout, isAdminAuth, getSalesReport } from '../controllers/adminController.js';
import authAdmin from '../middlewares/authAdmin.js';

const adminRouter = express.Router();

adminRouter.post('/login', adminLogin);
adminRouter.get('/is-auth', authAdmin, isAdminAuth);
adminRouter.get('/logout', adminLogout);
adminRouter.get("/sales-report", authAdmin, getSalesReport);

export default adminRouter;

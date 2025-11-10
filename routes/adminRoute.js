import express from 'express';
import { adminLogin, adminLogout, isAdminAuth } from '../controllers/adminController.js';
import authAdmin from '../middlewares/authAdmin.js';

const adminRouter = express.Router();

Router.post('/login', adminLogin);
Router.get('/is-auth', authAdmin, isAdminAuth);
Router.get('/logout', adminLogout);

export default adminRouter;

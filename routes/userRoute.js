import express from 'express';
import { isAuth, login, logout, register, userList, getUserCount, toggleUserStatus } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/is-auth', isAuth);   // ✅ No middleware needed if you're checking inside isAuth
router.get('/logout', logout);
router.get('/userList', userList);
router.get('/count', getUserCount);
router.patch("/toggle-status/:id", toggleUserStatus);

export default router;

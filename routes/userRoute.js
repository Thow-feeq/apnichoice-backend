import express from 'express';
import { isAuth, login, logout, register, userList, getUserCount } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/is-auth', isAuth);   // ✅ No middleware needed if you're checking inside isAuth
router.get('/logout', logout);
router.get('/userList', userList);
router.get('/count', getUserCount);

export default router;

import express from 'express';
import {
  isAuth,
  login,
  logout,
  register,
  userList,
  getUserCount
} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/is-auth', isAuth); // Optional: can add authUser here if needed
router.get('/logout', authUser, logout);
router.get('/userList', authUser, userList);
router.get('/count', authUser, getUserCount);

export default router;

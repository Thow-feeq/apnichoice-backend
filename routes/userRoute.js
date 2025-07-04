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

const userRouter = express.Router();

// Public Routes
userRouter.post('/register', register);
userRouter.post('/login', login);

// Protected Routes (requires auth)
userRouter.get('/is-auth', authUser, isAuth);
userRouter.get('/logout', authUser, logout);

// Admin Routes (you can add role checks inside the controller if needed)
userRouter.get('/userList', authUser, userList);
userRouter.get('/count', authUser, getUserCount);

export default userRouter;

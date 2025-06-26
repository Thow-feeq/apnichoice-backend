import express from 'express';
import { isAuth, login, logout, register, userList, getUserCount } from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.get('/is-auth', authUser, isAuth)
userRouter.get('/logout', authUser, logout)

userRouter.get('/userList', authUser, userList);

// GET /api/users/count
userRouter.get('/count', getUserCount);

export default userRouter
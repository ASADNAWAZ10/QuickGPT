import express from 'express'
import { getPushlishedImages, getUser, loginUser, registerUser } from '../controller/UserController.js';
import  protect from '../middlewere/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data',protect, getUser)
userRouter.get('/published-images', getPushlishedImages)

export default userRouter;
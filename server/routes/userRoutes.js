import express from 'express';
import {  getUser, loginUser, userRegister } from '../controllers/userController.js';
import  protect  from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post('/register',userRegister)
userRouter.post('/login',loginUser)
userRouter.get('/getData',protect,getUser)
/*userRouter.get('/published-images',getPublishedImages)*/



export default userRouter;
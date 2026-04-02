const express=require('express');
const {httpSignUpUser}=require('./auth.controller');

const authRouter=express.Router();

authRouter.post('/signup',httpSignUpUser);

module.exports=authRouter;
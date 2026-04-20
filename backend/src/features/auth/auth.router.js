const express=require('express');
const { httpSignUpUser ,httpLoginUser} = require("./auth.controller");

const authRouter=express.Router();

authRouter.post("/signup", httpSignUpUser);
authRouter.post("/login", httpLoginUser);


module.exports=authRouter;
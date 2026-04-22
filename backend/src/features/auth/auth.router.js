const express=require('express');
const { httpSignUpUser ,httpLoginUser} = require("./auth.controller");
const { googleCallback ,redirectToGoogle} = require("./auth.controller");
const authRouter=express.Router();

authRouter.post("/signup", httpSignUpUser);
authRouter.post("/login", httpLoginUser);
authRouter.get("/google", redirectToGoogle);
authRouter.get("/google/callback", googleCallback);

module.exports=authRouter;
const express=require('express');
const { httpSignUpUser ,httpLoginUser,httpLogoutUser} = require("./auth.controller");
const { googleCallback ,redirectToGoogle} = require("./auth.controller");
const { httpGetCurrentUser} = require("./auth.controller");
const {verifyToken}=require('../../middlewares/auth.middleware');
const authRouter=express.Router();

authRouter.post("/signup", httpSignUpUser);
authRouter.post("/login", httpLoginUser);
authRouter.post("/logout", httpLogoutUser);
authRouter.get("/google", redirectToGoogle);
authRouter.get("/google/callback", googleCallback);
authRouter.get("/me", verifyToken, httpGetCurrentUser);

module.exports=authRouter;
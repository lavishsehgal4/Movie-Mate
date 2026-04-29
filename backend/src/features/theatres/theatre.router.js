const express=require('express');
const {verifyToken}=require('../../middlewares/auth.middleware');

const {httpCreateTheatre}=require('./theatre.controller');

const theatreRouter=express.Router();

theatreRouter.post('/create',verifyToken,httpCreateTheatre);
module.exports=theatreRouter;
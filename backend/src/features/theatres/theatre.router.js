const express=require('express');
const {verifyToken}=require('../../middlewares/auth.middleware');

const {httpCreateTheatre,httpGetMyTheatres}=require('./theatre.controller');

const theatreRouter=express.Router();

theatreRouter.post('/create',verifyToken,httpCreateTheatre);
theatreRouter.get('/my',verifyToken,httpGetMyTheatres);
module.exports=theatreRouter;
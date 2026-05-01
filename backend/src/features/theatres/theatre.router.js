const express=require('express');
const { httpCheckUserTheatreAccess } = require("./theatre.controller");
const {verifyToken}=require('../../middlewares/auth.middleware');

const {httpCreateTheatre,httpGetMyTheatres,httpAttachFacilitiesToTheatre}=require('./theatre.controller');

const theatreRouter=express.Router();

theatreRouter.post('/create',verifyToken,httpCreateTheatre);
theatreRouter.get('/my',verifyToken,httpGetMyTheatres);
theatreRouter.post("/attach", httpAttachFacilitiesToTheatre);

theatreRouter.get("/has-access", verifyToken,httpCheckUserTheatreAccess);

module.exports=theatreRouter;
const express=require('express');
const { httpCheckUserTheatreAccess,httpGetTheatreById  } = require("./theatre.controller");
const {verifyToken}=require('../../middlewares/auth.middleware');

const {httpCreateTheatre,httpGetMyTheatres,httpAttachFacilitiesToTheatre}=require('./theatre.controller');

const theatreRouter=express.Router();

theatreRouter.post('/create',verifyToken,httpCreateTheatre);
theatreRouter.get('/my',verifyToken,httpGetMyTheatres);
theatreRouter.post("/attach", httpAttachFacilitiesToTheatre);

theatreRouter.get("/has-access", verifyToken,httpCheckUserTheatreAccess);
theatreRouter.get("/by-id", verifyToken, httpGetTheatreById);

module.exports=theatreRouter;
const express=require('express');
const { httpCheckUserTheatreAccess,httpGetTheatreById,httpGetFacilitiesWithSelected  } = require("./theatre.controller");
const {verifyToken}=require('../../middlewares/auth.middleware');

const {httpCreateTheatre,httpGetMyTheatres,httpSyncTheatreFacilities}=require('./theatre.controller');

const theatreRouter=express.Router();

theatreRouter.post('/create',verifyToken,httpCreateTheatre);
theatreRouter.get('/my',verifyToken,httpGetMyTheatres);
theatreRouter.post("/facilities/sync",verifyToken, httpSyncTheatreFacilities);

theatreRouter.get("/has-access", verifyToken,httpCheckUserTheatreAccess);
theatreRouter.get("/by-id", verifyToken, httpGetTheatreById);
theatreRouter.get(
  "/facilities",
  verifyToken,
  httpGetFacilitiesWithSelected
);

module.exports=theatreRouter;
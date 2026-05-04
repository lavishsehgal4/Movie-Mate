const express=require('express');
const {getMovieCounts,startSyncController}=require('./movies.controller');
const movieRouter=express.Router();

movieRouter.get("/count", (req, res, next) => {
  console.log(`➡️  [ROUTER] ${new Date().toISOString()} GET /movies/count hit`);
  next();
}, getMovieCounts);

movieRouter.post("/start-sync", (req, res, next) => {
  console.log(`➡️  [ROUTER] ${new Date().toISOString()} POST /movies/start-sync hit`);
  next();
}, startSyncController);

module.exports=movieRouter;
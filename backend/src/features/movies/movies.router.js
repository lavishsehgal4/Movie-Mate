const express=require('express');
const {getMovieCounts,startSyncController,httpGetMovies,httpGetMovieDetails}=require('./movies.controller');
const {verifyToken}=require('../../middlewares/auth.middleware');

const movieRouter=express.Router();

movieRouter.get("/count", (req, res, next) => {
  console.log(`➡️  [ROUTER] ${new Date().toISOString()} GET /movies/count hit`);
  next();
}, getMovieCounts);

movieRouter.post("/start-sync", (req, res, next) => {
  console.log(`➡️  [ROUTER] ${new Date().toISOString()} POST /movies/start-sync hit`);
  next();
}, startSyncController);


movieRouter.get("/",httpGetMovies);

movieRouter.get(
  "/movie-details",
  httpGetMovieDetails
);

module.exports=movieRouter;
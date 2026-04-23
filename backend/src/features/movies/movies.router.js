const express=require('express');
const {getMovieCounts}=require('./movies.controller');
const movieRouter=express.Router();

movieRouter.get("/sync-count", getMovieCounts);

module.exports=movieRouter;
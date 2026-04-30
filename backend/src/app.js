const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

//Routers
const authRouter=require('./features/auth/auth.router');
const movieRouter=require("./features/movies/movies.router");
const theatreRouter=require("./features/theatres/theatre.router");
const facilityRouter=require("./features/theatreFacilities/facilities.router");
const app = express();

app.use(cors({
  origin: "*",        // For development (change to specific origin later)
  
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get('/test',(req,res)=>{
    res.send("server is running");
});

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/movies',movieRouter);
app.use('/api/v1/theatre',theatreRouter);
app.use('/api/v1/facilities',facilityRouter);
module.exports = app;

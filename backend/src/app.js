const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

//Routers
const authRouter=require('./features/auth/auth.router');
const movieRouter=require("./features/movies/movies.router");
const app = express();

app.use(cors({
  origin: "*",        // For development (change to specific origin later)
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

app.get('/test',(req,res)=>{
    res.send("server is running");
});

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/movies',movieRouter);
module.exports = app;

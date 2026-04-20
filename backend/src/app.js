const express = require("express");

//Routers
const authRouter=require('./features/auth/auth.router');
const app = express();

app.use(express.json());

app.get('/test',(req,res)=>{
    res.send("server is running");
});

app.use('/api/v1/auth',authRouter);
module.exports = app;

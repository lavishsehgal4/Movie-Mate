const express = require("express");
const authRouter=require('./features/auth/auth.router');
const app = express();

app.use(express.json());
app.get('/test',(req,res)=>{
    res.status(200).send(" server is ok")
});
app.use("/",authRouter);
module.exports = app;

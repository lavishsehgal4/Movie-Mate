const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

//Routers
const authRouter=require('./features/auth/auth.router');
const movieRouter=require("./features/movies/movies.router");
const theatreRouter=require("./features/theatres/theatre.router");
const facilityRouter=require("./features/theatreFacilities/facilities.router");
const screenRouter=require('./features/screens/screen.router');
const seatRouter=require('./features/seats/seat.router');
const showRouter=require('./features/shows/show.router');
const locationRouter=require('./features/location/location.router');
const showSeatRouter=require('./features/showSeat/showSeat.router');
const app = express();

app.use(cors({
  origin: "http://localhost:5173", // 🔥 exact frontend URL
  credentials: true
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
app.use('/api/v1/screens',screenRouter);
app.use('/api/v1/seats',seatRouter);
app.use('/api/v1/shows',showRouter);
app.use('/api/v1/location',locationRouter);
app.use('/api/v1/showSeat',showSeatRouter);

module.exports = app;

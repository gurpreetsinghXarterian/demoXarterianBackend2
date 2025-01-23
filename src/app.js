const express = require("express");
const app = express();
const cors = require('cors');
const userRouter = require("./routes/userRouter");
const postRouter = require("./routes/postRouter"); 
const otpRouter = require("./routes/otpRouter"); 

app.use(cors());
app.use(express.json());

console.log("App is running...");

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/otp", otpRouter);

module.exports = app;

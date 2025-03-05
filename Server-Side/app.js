const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const userRouter = require("./routes/userRoutes");

console.log(process.env.NODE_ENV);

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

// app.use("/", (req, res) => {
//   res.status(200).json({
//     status: "success",
//     message: "Welcome to the API",
//   });
// });

app.use((req, res, next) => {
  console.log("Protocol:", req.protocol);
  console.log("Host:", req.get("host"));
  console.log("Original URL:", req.originalUrl);
  next();
});

// User Route
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

// Global Error Handler Middleware
app.use(globalErrorHandler);

module.exports = app;

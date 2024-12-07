const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config({path: "config.env"});
const dbConnection = require("./config/database");
const compression = require("compression");
const mountRoutes = require("./routes");

const cors = require("cors");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");

dbConnection();
//Conncet with dv

//  express app
const app = express();

// enable other domains to access your application
app.use(cors());
app.use("*", cors());
//compress all responses
app.use(compression());

//  Middlewares

app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode : ${process.env.NODE_ENV}`);
}

// Mount Routes

mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route ${req.originalUrl}`, 400));
});

//Global errir handling middleware
app.use(globalError);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

// Handle rejictions outside express
process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection Errors : ${err.name} | ${err.message}`);

  // waiting for pinding requists
  server.close(() => {
    console.log(`Shutting down...`);
    process.exit(1);
  });
});




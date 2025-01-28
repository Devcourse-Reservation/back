var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const dotenv = require("dotenv");
dotenv.config({ path: "back/.env" });

var app = express();

// 라우트 등록
const flightRoute = require("./routes/flightRoute");
const authRoute = require("./routes/authRoute");
const ticketRoute = require("./routes/ticketRoute");
const airportRoute = require("./routes/airportRoute");

const PORT = process.env.PORT || 3000;

// 모델 임포트
const db = require("./models"); // models/index.js에서 정의된 db 객체 사용

db.sequelize
  .authenticate()
  .then(() => {
    console.log("MySQL connected successfully");
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("Models synced");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use('/airports', airportRoute);
app.use("/tickets", ticketRoute);
app.use("/flights", flightRoute);
app.use("/auth", authRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(function (req, res, next) {
  next(createError(404));
});

// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

module.exports = app;

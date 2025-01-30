var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

// 라우트 등록
const flightRoute = require("./routes/flightRoute");
const authRoute = require("./routes/authRoute");
const ticketRoute = require("./routes/ticketRoute");
const queueRoute = require("./routes/queueRoute");
const deleteExpiredQueue = require('./jobs/deleteExpiredQueue');
const consumeQueue = require('./kafka/consumer');

const PORT = process.env.PORT || 3000;

// 모델 임포트
const db = require("./models");

db.sequelize
  .authenticate()
  .then(() => {
    console.log("MySQL connected successfully");
    if (process.env.NODE_ENV === 'development') {
      return db.sequelize.sync();
    }
  })
  .then(() => {
    console.log("Models synced");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Kafka Consumer 실행
consumeQueue()
  .then(() => {
    console.log("Kafka Consumer started successfully.");
  })
  .catch((err) => {
    console.error("Error starting Kafka Consumer:", err);
    process.exit(1); // 필요한 경우 프로세스 종료
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
app.use("/queue", queueRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
require('./websocket/websocket')(server);

// 만료된 항목 삭제 주기 작업
const schedule = require('node-schedule');
schedule.scheduleJob('0 * * * *', () => {
  deleteExpiredQueue();
});

// WebSocket 서버 초기화
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
require('./websocket/websocket')(server);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message,
    },
  });
});



module.exports = app;
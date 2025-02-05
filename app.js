var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const http = require("http");
const initSocket = require("./socket");
require("./jobs/ticketReminderJob"); // 스케줄러 파일 불러오기
//const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

const cors = require("cors");

// ✅ 모든 요청에서 CORS 허용
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3001",  // ✅ 프론트엔드 도메인만 허용
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));


// 라우트 등록
const airportRoute = require("./routes/airportRoute");
const flightRoute = require("./routes/flightRoute");
const authRoute = require("./routes/authRoute");
const ticketRoute = require("./routes/ticketRoute");
const queueRoute = require("./routes/queueRoute");
const seatRoutes = require("./routes/seatRoute");
const paymentRoute = require("./routes/paymentRoute");

const deleteExpiredQueue = require('./jobs/deleteExpiredQueue');
const consumeQueue = require('./kafka/consumer');
// const PORT = process.env.PORT || 3000;

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

  
//app.use(cors());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/airports", airportRoute);
app.use("/tickets", ticketRoute(io));
app.use("/flights", flightRoute);
app.use("/auth", authRoute);
app.use("/queue", queueRoute);
app.use("/seats", seatRoutes(io));
app.use("/payments", paymentRoute(io));

// 만료된 항목 삭제 주기 작업
const schedule = require('node-schedule');
schedule.scheduleJob('0 * * * *', () => {
  deleteExpiredQueue();
});

// WebSocket 서버 초기화
server.listen(process.env.PORT || 3000, () => {
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
const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const app = express();

dotenv.config({ path: "./config/.env" });

const authRoute = require("./routes/authRoute");

app.use("/auth", authRoute);

const port = process.env.PORT;

// 서버 실행 및 DB 연결
sequelize
  .sync({ force: false }) // 테이블 덮어쓰지 않도록 설정
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const http = require("http");
const initSocket = require("./socket");

dotenv.config({ path: "back/config/.env" });

const app = express();
app.use(express.json());

const seatRoutes = require("./routes/seatRoute");
const server = http.createServer(app);

const io = initSocket(server);

app.use("/seats", seatRoutes(io));

sequelize
  .sync({ force: false })
  .then(() => {
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

module.exports = app;

const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const app = express();
const http = require("http");
const initSocket = require("./socket");

dotenv.config({ path: "back/config/.env" });
const port = process.env.PORT;
const server = http.createServer(app);

const io = initSocket(server);
const ticketRoute = require("./routes/tickets");

app.use("/tickets", ticketRoute(io));

sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(`port : ${port}`);
    console.error("Error connecting to the database:", err);
  });

module.exports = app;

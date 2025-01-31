const express = require("express");
const { getSeat } = require("../controllers/seatController");

const router = express.Router();

module.exports = (io) => {
  router.put("/:seatId", (req, res) => getSeat(req, res));
  return router;
};

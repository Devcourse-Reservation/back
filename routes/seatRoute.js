const express = require("express");
const { updateSeat } = require("../controllers/seatController");

const router = express.Router();

module.exports = (io) => {
  router.put("/:seatId", (req, res) => updateSeat(req, res, io));
  return router;
};

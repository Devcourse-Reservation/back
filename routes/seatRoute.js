const express = require("express");
const { updateSeat } = require("../controllers/seatController");

const router = express.Router();

module.exports = (io) => {
  // router.get("/:flightId", (req, res) => getSeats(req, res, io));

  router.put("/:seatId", (req, res) => updateSeat(req, res));
  return router;
};

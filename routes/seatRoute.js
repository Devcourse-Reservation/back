const express = require("express");
const { getSeats, bulkCreateSeats } = require("../controllers/seatController");

const router = express.Router();

module.exports = (io) => {
  // router.get("/:flightId", (req, res) => getSeats(req, res, io));

  router.post("/:flightId", (req, res) => bulkCreateSeats(req, res));

  return router;
};

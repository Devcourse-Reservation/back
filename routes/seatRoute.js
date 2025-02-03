const express = require("express");
const {
  updateSeat,
  bulkCreateSeats,
  getSeats,
} = require("../controllers/seatController");
const { verifyToken } = require("../middlewares/jwtMiddleware");

const router = express.Router();

module.exports = (io) => {
  router.put("/:seatId",verifyToken, (req, res) => updateSeat(req, res, io));
  router.post("/:flightId",verifyToken, (req, res) => bulkCreateSeats(req, res));
  router.get("/:flightId",verifyToken, (req, res) => getSeats(req, res));
  return router;
};

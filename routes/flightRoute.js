const express = require("express");
const {
  searchFlights,
  getFlightDetails,
} = require("../controllers/flightController");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwtMiddleware");

router.use(express.json());
router.use(verifyToken);

router.post("/search", searchFlights);
router.get("/:flightId", getFlightDetails);

module.exports = router;

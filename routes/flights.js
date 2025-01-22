const express = require("express");
const router = express.Router();
router.use(express.json());
const { verifyToken } = require("../middlewares/jwtMiddleware");
router.use(verifyToken);

const {
  searchFlights,
  getFlightDetails,
} = require("../controllers/flightController");

router.post("/search", searchFlights);
router.get("/:flightId", getFlightDetails);

module.exports = router;

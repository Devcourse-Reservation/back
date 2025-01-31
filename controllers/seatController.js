const db = require("../models");
const { StatusCodes } = require("http-status-codes");
const db = require("../models");
const { StatusCodes } = require("http-status-codes");

const getSeats = async (req, res) => {
  const { flightId } = req.params;

  try {
    const seats = await db.Seats.findAll({
      where: { flightId: flightId },
    });

    if (!seats)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tickets Not found" });

    return res.status(StatusCodes.OK).json(seats);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

module.exports = {
  getSeats,
};

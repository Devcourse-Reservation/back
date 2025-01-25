const db = require("../models");
const { StatusCodes } = require("http-status-codes");
const { SeatStatus } = require("../common/StatusEnums");
const {
  validateSeatFields,
  validateSeatsArray,
} = require("../utils/seatValidation");
const { validateFlightId } = require("../utils/flightValidation");

const bulkCreateSeats = async (req, res) => {
  const { seats } = req.body;
  const { flightId } = req.params;

  validateSeatsArray(seats);
  validateSeatFields(seats);

  const transaction = await db.sequelize.transaction();

  try {
    const flight = await db.Flights.findOne({ where: { id: flightId } });
    if (!flight)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Flight Not found" });

    const processedSeats = seats.map((seat) => {
      return {
        flightId,
        seatNumber: seat.seatNumber,
        class: seat.class,
        status: SeatStatus.Available,
        price: seat.price,
      };
    });
    const createdSeats = await db.Seats.bulkCreate(processedSeats, {
      validate: true,
      transaction,
    });

    await transaction.commit();

    return res.status(StatusCodes.CREATED).json(createdSeats);
  } catch (error) {
    await transaction.rollback();

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

module.exports = { bulkCreateSeats };

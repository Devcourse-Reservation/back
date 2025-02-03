const db = require("../models");
const { StatusCodes } = require("http-status-codes");
const { SeatStatus } = require("../common/StatusEnums");
const { validateUserType } = require("../utils/userValidation");
const {
  validateSeatsArray,
  validateSeatFields,
} = require("../utils/seatValidation");
const updateSeat = async (req, res, io) => {
//   validateUserType(req.user);
  const { seatId } = req.params;
  const { status } = req.body;

  if (!Object.values(SeatStatus).includes(status)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Invalid status value.",
      validStatuses: Object.values(SeatStatus),
    });
  }
  try {
    const seat = await db.Seats.findByPk(seatId);
    if (!seat)
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Seat not found " });

    await seat.update({ status });

    io.to(seat.flightId).emit("seatUpdate", {
      seatId: seat.id,
      status: seat.status,
    });

    res.status(StatusCodes.OK).json({
      message: "좌석 정보가 성공적으로 업데이트되었습니다.",
      seat,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

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

module.exports = { updateSeat, bulkCreateSeats, getSeats };

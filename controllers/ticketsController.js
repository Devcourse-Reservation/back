const sequelize = require("../config/db");
const db = require("../models");
const { SeatStatus, TicketStatus } = require("../common/StatusEnums");
const { StatusCodes } = require("http-status-codes");
const {
  generateRandomTicketNumber,
} = require("../utils/generateRandomTicketNumber");
const { TicketType } = require("../common/TypeEnums");
const { validateSeats } = require("../utils/seatValidation");

const postTickets = async (req, res, io) => {
  const { flightId, ticketType } = req.body;
  let { seatIds } = req.body;
  const userId = req.userId;

  if (!Array.isArray(seatIds)) {
    seatIds = [seatIds];
  }

  const uniqueSeatIds = new Set(seatIds);
  if (uniqueSeatIds.size !== seatIds.length) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Seat IDs should not contain duplicates.",
    });
  }

  if (!Object.values(TicketType).includes(ticketType)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Invalid ticket type.",
    });
  }

  let dbTransaction;

  try {
    dbTransaction = await sequelize.transaction();

    const seats = await db.Seats.findAll({
      where: {
        id: seatIds,
        flightId: flightId,
        status: SeatStatus.Available,
      },
      lock: true,
      transaction: dbTransaction,
    });

    validateSeats(seatIds, seats);

    await Promise.all(
      seats.map(async (seat) => {
        seat.status = SeatStatus.Reserved;
        await seat.save({ transaction: dbTransaction });
        io.to(flightId).emit("seatUpdate", {
          seatId: seat.id,
          status: seat.status,
        });
      })
    );

    const flight = await db.Flights.findOne({
      where: { id: flightId },
    });

    const tickets = await Promise.all(
      seatIds.map(async (seatId) => {
        const ticket = await db.Tickets.create(
          {
            userId,
            flightId,
            seatId,
            status: TicketStatus.Pending,
            reservationNumber: generateRandomTicketNumber(
              flight.flightName,
              seatId
            ),
            ticketType,
          },
          { transaction: dbTransaction }
        );
        return ticket;
      })
    );
    await dbTransaction.commit();

    return res.status(StatusCodes.CREATED).json(tickets);
  } catch (error) {
    if (dbTransaction) {
      await dbTransaction.rollback();
    }

    console.error("Error creating ticket:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { postTickets };

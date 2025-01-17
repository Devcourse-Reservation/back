const sequelize = require("../config/db");
const db = require("../models");
const { SeatStatus, TicketStatus } = require("../common/StatusEnums");
const { StatusCodes } = require("http-status-codes");
const generateRandomTicketNumber = require("../utils/generateRandomTicketNumber");

const postTickets = async (req, res) => {
  const { userId, flightId, seatId, reservedAt } = req.body;

  let dbTransaction;

  try {
    dbTransaction = await sequelize.transaction();
    const seats = await db.Seats.findOne({
      where: {
        id: seatId,
        flight_id: flightId,
        status: SeatStatus.Available,
      },
      lock: true,
      transaction: dbTransaction,
    });

    if (!seats) {
      throw new Error("Seat already reserved.");
    }

    seats.status = SeatStatus.Reserved;
    await seats.save({ transaction: dbTransaction });

    const reservationNumber = generateRandomTicketNumber();

    const ticket = await db.Tickets.create(
      {
        userId,
        flightId,
        seatId,
        status: TicketStatus.Pending,
        reservationNumber,
        reservedAt,
      },
      { transaction: dbTransaction }
    );

    await dbTransaction.commit();
    return res.status(StatusCodes.CREATED).json(ticket);
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

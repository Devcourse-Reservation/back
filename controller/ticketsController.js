const db = require("../models");
const { StatusCodes } = require("http-status-codes");
const {
  generateRandomTicketNumber,
} = require("../utils/generateRandomTicketNumber");
const { TicketType } = require("../common/TypeEnums");
const { validateSeats } = require("../utils/seatValidation");


const getTicketByTicketId = async (req, res) => {
  let { ticketId } = req.params;
  const { userId, flightId } = req.body;
  ticketId = parseInt(ticketId);
  try {
    const ticket = await db.Tickets.findOne({
      where: { id: ticketId },
      include: [
        {
          model: db.Seats,
          attributes: ["status", "class"],
        },
        {
          model: db.Flights,
          attributes: ["departureTime", "arrivalTime", "airline"],
          include: [
            {
              model: db.Airports,
              as: "departureAirport",
              attributes: ["name", "code"],
            },
            {
              model: db.Airports,
              as: "arrivalAirport",
              attributes: ["name", "code"],
            },
          ],
        },
        {
          model: db.Payments,
          attributes: ["status"],
        },
      ],
    });

    if (!ticket)
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "Ticket Not found",
      });

    const passengerCount = await db.Tickets.count({
      where: {
        userId: userId,
        flightId: flightId,
      },
    });

    if (passengerCount === 0)
      return res.status(StatusCodes.NOT_FOUND).json({
        error: "userId or flightId is missing",
      });

    return res.status(StatusCodes.OK).json({ ticket, passengerCount });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

const getTicketsByUserId = async (req, res) => {
  const { userId } = req.body; // 로그인 API 구현되면 변경될 예정

  try {
    const tickets = await db.Tickets.findAll({
      where: { userId: userId },
      include: [
        {
          model: db.Flights,
          attributes: ["departureTime"],

          include: [
            {
              model: db.Airports,
              as: "departureAirport",
              attributes: ["name", "code"],
            },
            {
              model: db.Airports,
              as: "arrivalAirport",
              attributes: ["name", "code"],
            },
          ],
        },
      ],
    });
    if (tickets.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Tickets Not found" });
    }

    return res.status(StatusCodes.OK).json(tickets);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

const postTickets = async (req, res) => {
  const { userId, flightId, seatIds, ticketType } = req.body;

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
        return seat.save({ transaction: dbTransaction });
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
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

module.exports = { getTicketByTicketId, getTicketsByUserId, postTickets };
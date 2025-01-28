const db = require("../models");
const { StatusCodes } = require("http-status-codes");
const {
  generateRandomTicketNumber,
} = require("../utils/generateRandomTicketNumber");
const { TicketType } = require("../common/TypeEnums");
const { SeatStatus, TicketStatus } = require("../common/StatusEnums");
const { validateSeats } = require("../utils/seatValidation");
const { sequelize } = db;
const sendEmail = require("../utils/sendEmail");

const getTicketByTicketId = async (req, res) => {
  let { ticketId } = req.params;
  //const { flightId } = req.body;
  const userId = req.userId;

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
    const flightId = ticket.flightId;
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
  const userId = req.userId; // 로그인 API 구현되면 변경될 예정

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
  const userId = req.userId
  const { flightId, seatIds, ticketType } = req.body;
  const processedSeatIds = Array.isArray(seatIds) ? seatIds : [seatIds];

  const uniqueSeatIds = new Set(processedSeatIds);
  if (uniqueSeatIds.size !== processedSeatIds.length) {
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
        id: processedSeatIds,
        flightId: flightId,
        status: SeatStatus.Available,
      },
      lock: true,
      transaction: dbTransaction,
    });

    validateSeats(processedSeatIds, seats);

    await Promise.all(
      seats.map(async (seat) => {
        seat.status = SeatStatus.Reserved;
        return seat.save({ transaction: dbTransaction });
      })
    );

    const flight = await db.Flights.findOne({
      where: { id: flightId },
    });

    const user = await db.Users.findOne({
      where: { id: userId },
    });

    const tickets = await Promise.all(
      processedSeatIds.map(async (seatId) => {
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

    const ticketDetails = tickets
      .map((ticket) => `Seat ID: ${ticket.seatId}, Ticket Number: ${ticket.reservationNumber}`)
      .join("\n");

    const messageText = `
      Thank you for your reservation!
      Here are your ticket details:
      Flight: ${flight.flightName}
      Ticket Type: ${ticketType}
      Seats:
      ${ticketDetails}
    `;
    
    await sendEmail(user.email, "Your Ticket Reservation", messageText);

    return res.status(StatusCodes.CREATED).json(tickets);
  } catch (error) {
    if (dbTransaction && !dbTransaction.finished) {
      await dbTransaction.rollback();
    }

    console.error("Error creating ticket:", error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { getTicketByTicketId, getTicketsByUserId, postTickets };
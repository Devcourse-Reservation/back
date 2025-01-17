const db = require("../models");
const { StatusCodes } = require("http-status-codes");

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
module.exports = { getTicketByTicketId };

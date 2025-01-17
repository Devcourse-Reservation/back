const db = require("../models");
const { StatusCodes } = require("http-status-codes");

const getTicketsByUserId = async (req, res) => {
  const { userId } = req.body; // 로그인 API 구현되면 변경될 예정

  try {
    const tickets = await db.Tickets.findAll({
      where: { user_id: userId },
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
module.exports = { getTicketsByUserId };

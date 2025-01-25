const db = require("../models");
const { StatusCodes } = require("http-status-codes");
const { SeatStatus } = require("../common/StatusEnums");
const { validateUserType } = require("../utils/userValidation");
const updateSeat = async (req, res) => {
  validateUserType(req.user);
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

module.exports = { updateSeat };

const sequelize = require("../config/db");
const axios = require("axios");
const db = require("../models");
const {
  PaymentStatus,
  SeatStatus,
  TicketStatus,
} = require("../common/StatusEnums");
const { StatusCodes } = require("http-status-codes");

const refundPayment = async (req, res, io) => {
  const { paymentId, reason } = req.body;

  try {
    if (!paymentId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "결제 ID가 누락되었습니다." });
    }

    const paymentRecord = await db.Payments.findOne({
      where: { id: paymentId },
    });
    if (!paymentRecord) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "결제 정보를 찾을 수 없습니다." });
    }

    if (paymentRecord.status !== PaymentStatus.Paid) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: "이미 취소된 결제입니다." });
    }

    const refundPayload = { reason: reason || "고객 요청 환불" };

    const refundResponse = await axios.post(
      `https://api.portone.io/payments/cancel`,
      refundPayload,
      {
        headers: {
          Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (refundResponse.data.code !== 0) {
      throw new Error("환불 실패: " + refundResponse.data.message);
    }

    const transaction = await sequelize.transaction();
    try {
      
      await db.Refunds.create(
        {
          paymentId: paymentRecord.id,
          amount: paymentRecord.amount,
          reason: reason || "고객 요청 환불",
        },
        { transaction }
      );
      await paymentRecord.update(
        { status: PaymentStatus.Refunded },
        { transaction }
      );

      const ticket = await db.Tickets.findOne({
        where: { id: paymentRecord.ticketId },
      });

      if (!ticket) {
        await transaction.rollback();
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "티켓 정보를 찾을 수 없습니다.",
        });
      }

      ticket.status = TicketStatus.Cancelled;
      await ticket.save({ transaction });

      const seat = await db.Seats.findOne({ where: { id: ticket.seatId } });

      if (!seat) {
        await transaction.rollback();
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "좌석 정보를 찾을 수 없습니다.",
        });
      }

      seat.status = SeatStatus.Available;
      await seat.save({ transaction });

      await transaction.commit();

      io.to(ticket.flightId).emit("seatUpdate", {
        seatId: seat.id,
        status: SeatStatus.Available,
      });

      console.log("환불 성공:", refundResponse.data);
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "환불 성공",
        refundData: refundResponse.data,
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error(
      "환불 오류:",
      error.response ? error.response.data : error.message
    );
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "환불 처리 중 오류 발생",
      error: error.response ? error.response.data : error.message,
    });
  }
};

module.exports = {
  refundPayment,
};

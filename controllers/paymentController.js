const axios = require("axios");
const db = require("../models");
const { sequelize } = db;
const { StatusCodes } = require("http-status-codes");
const PortOne = require("@portone/server-sdk")
const CustomError = require("../utils/customError");
const dotenv = require("dotenv");
dotenv.config({ path: "flights-back/config/.env" });
const {
    getTicketData,
    updateTicketStatus,
} = require("../services/orderService");
const {
  PaymentStatus,
  SeatStatus,
  TicketStatus,
} = require("../common/StatusEnums");
const sendEmail = require("../utils/sendEmail");

// 결제 검증 및 완료 처리
const completePayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  const { paymentId, order } = req.body;
  try {
    
    if (!paymentId || !order) {
      throw new CustomError(StatusCodes.BAD_REQUEST,  "잘못된 요청입니다." );
    }
    const orderData = await getTicketData(order);
    if (!orderData) {
      throw new CustomError(StatusCodes.NOT_FOUND, "주문 정보를 찾을 수 없습니다.");
    }
    if(orderData.status == "Paid"){
      throw new CustomError(StatusCodes.BAD_REQUEST, "이미 결제된 상품입니다." );
    }
    // 1. PortOne 결제내역 단건조회 API 호출
    const paymentResponse = await axios.get(
        `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
        {
          headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` },
        }
    );
      // axios에서는 status 체크
    if (paymentResponse.status !== StatusCodes.OK) {
      throw new CustomError(StatusCodes.NOT_FOUND,"해당 상품 결제내역이 없습니다.")
    }
      // 결제 정보는 paymentResponse.data에 있음
    const payment = paymentResponse.data;
    // 3. 결제 금액 검증
    if (orderData.Seat.price !== payment.amount.total) {
      throw new CustomError(StatusCodes.NOT_FOUND, "결제 금액 불일치. 위/변조 가능성 있음.");
    }
    // 4. 결제 상태 처리
    if (payment.status !== "PAID") {
      throw new CustomError(StatusCodes.BAD_REQUEST,`결제 상태가 PAID가 아닙니다. 현재 상태: ${payment.status}`)
    }
    else{
        await updateTicketStatus(order, TicketStatus.Confirmed, transaction);
  
        const messageText = `
            Thank you for your reservation!
            Here are your ticket details:
            Flight: ${orderData.Flight.flightName}
            Ticket Type: ${orderData.ticketType}
            Seats:
            Seat ID: ${orderData.seatId}, Ticket Number: ${orderData.reservationNumber}
        `;
        const user = await db.Users.findOne({
            where: { id: orderData.userId },
          });
        await sendEmail(user.email, "Your Ticket Reservation", messageText);
        // 그리고 order table을 작성해줍니다.
        await db.Payments.create({
            orderId: payment.id,
            userId: orderData.userId, 
            ticketId: orderData.id,
            amount: orderData.Seat.price,
            paymentMethod: payment.method.type,
            transactionId: payment.transactionId,
            status: PaymentStatus.Paid,
          }, { transaction });
        await transaction.commit();
        return res.status(StatusCodes.OK).json({
            message: "결제 검증 및 주문 처리 완료"
        });
    }
      
  } catch (error) {
    console.error("❌ 결제 검증 오류:", error.response ? error.response.data : error.message);
    await transaction.rollback();
    try {
      await axios.post(
        `https://api.portone.io/payments/${encodeURIComponent(paymentId)}/cancel`,
        { reason: "결제 검증 실패로 인한 자동 취소" },
        {
          headers: {
            Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ 자동 결제 취소 완료");
    } catch (refundError) {
      console.error("❌ 자동 결제 취소 실패:", refundError.response ? refundError.response.data : refundError.message);
    }

    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: "❌ 결제 검증 실패, 자동 취소 처리됨", 
      error: error.message 
    });
  }
};

// 환불 로직
const refundPayment = async (req, res, io) => {
  const { paymentId, reason } = req.body;

  try {
    if (!paymentId) {
      throw new CustomError( StatusCodes.BAD_REQUEST, 
        "결제 ID가 누락되었습니다.");
    }
    const refundPayload = { reason: reason || "고객 요청 환불" };

    const refundResponse = await axios.post(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}/cancel`,
      refundPayload,
      {
        headers: {
          Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!refundResponse) {
      throw new CustomError( StatusCodes.BAD_REQUEST, 
        "환불에 실패했습니다.");
    }

    const paymentRecord = await db.Payments.findOne({
      where: { orderId: paymentId },
    });

    if (!paymentRecord) {
      throw new CustomError( StatusCodes.NOT_FOUND, 
        "결제 정보를 찾을 수 없습니다.");
    }

    if (paymentRecord.status !== PaymentStatus.Paid) {
      throw new CustomError( StatusCodes.BAD_REQUEST, 
        "이미 취소된 결제입니다.");
    }
    const transaction = await sequelize.transaction();
    try {
      
      await db.Refunds.create(
        {
          paymentId: paymentRecord.id,
          amount: paymentRecord.amount,
          reason: reason || "고객 요청 환불",
          refundStatus: "refunded"
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
        throw new CustomError( StatusCodes.NOT_FOUND, 
          "티켓 정보를 찾을 수 없습니다.");
      }

      ticket.status = TicketStatus.Cancelled;
      await ticket.save({ transaction });

      const seat = await db.Seats.findOne({ where: { id: ticket.seatId } });

      if (!seat) {
        throw new CustomError( StatusCodes.NOT_FOUND, 
          "좌석 정보를 찾을 수 없습니다." );
      }

      seat.status = SeatStatus.Available;
      await seat.save({ transaction });

      await transaction.commit();
      //transaction = null;

      io.to(ticket.flightId).emit("seatUpdate", {
        seatId: seat.id,
        status: SeatStatus.Available,
      });

      console.log("환불 성공:");
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
    return res.status(error.statusCode || 500).json({ 
      success: false, 
      message: "❌ 결제 검증 실패, 자동 취소 처리됨", 
      error: error.message 
    });
  }
};


module.exports = { 
    completePayment, 
    refundPayment 
};

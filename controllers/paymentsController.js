const axios = require("axios");
const db = require("../models");
const { StatusCodes } = require("http-status-codes");
const PortOne = require("@portone/server-sdk")
const portone = PortOne.PortOneClient({ secret: process.env.PORTONE_API_SECRET })
const dotenv = require("dotenv");
dotenv.config({ path: "back/.env" });
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
  try {
    const { paymentId, orderedTicketId } = req.body;
    if (!paymentId || !orderedTicketId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "잘못된 요청입니다." });
    }
    const orderData = await getTicketData(orderedTicketId);
    if (!orderData) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "주문 정보를 찾을 수 없습니다." });
    }
    if(orderData.status == "Paid"){
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "이미 결제된 상품입니다." });
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
        throw new Error(`paymentResponse: ${JSON.stringify(paymentResponse.data)}`);
    }
      // 결제 정보는 paymentResponse.data에 있음
    const payment = paymentResponse.data;
    // 3. 결제 금액 검증
    if (orderData.Seat.price !== payment.amount.total) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "결제 금액 불일치. 위/변조 가능성 있음." });
    }
    // 4. 결제 상태 처리
    if(payment.status == "PAID") {
        await updateTicketStatus(orderedTicketId, "Paid");
  
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
            status: orderData.status,
        });
        return res.status(StatusCodes.OK).json({
            message: "결제 검증 및 주문 처리 완료"
        });
    }
      
  } catch (error) {
    console.error("❌ 결제 검증 오류:", error.response ? error.response.data : error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "결제 검증 실패", error: error.message });
  }
};

// 🎫 수기 결제 처리 (카드 정보 입력 후 결제 요청)
// 이거 진짜 돈나갑니다. 당일 환불 된다네요.
// 임의 정보로 설정함.
const postPayment = async (req, res) => {
  try {
    const paymentId = req.params.paymentId;

    // 포트원 수기(키인)결제 API 호출
    const paymentResponse = await axios.post(
        `https://api.portone.io/payments/${encodeURIComponent(paymentId)}/instant`,
      {
        //storeId : `${process.env.STORE_ID}`,
        channelKey: `${process.env.CHANNEL_KEY}`, // 채널 키
        method: { card: 
                    { credential: 
                        {   number: "9490947378031025",
                            expiryYear: "27",
                            expiryMonth: "11",
                            birthOrBusinessRegistrationNumber: "000809",
                            passwordTwoDigits: "25"
                        }
                    }
                },
        orderName: "t",
        amount: { 
            total: 150,
         },
        currency: "KRW"
      },
      {
        headers: {
          Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 결제 성공 시 응답
    return res.json({
      success: true,
      message: "결제 성공",
      paymentData: paymentResponse.data,
    });
  } catch (error) {
    console.error("❌ 수기 결제 오류:", error.response ? error.response.data : error.message);
    return res.status(500).json({
      success: false,
      message: "결제 처리 중 오류 발생",
      error: error.message,
    });
  }
};

// 환불 로직
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
    completePayment, 
    postPayment, 
    refundPayment 
};

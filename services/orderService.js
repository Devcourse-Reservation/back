const db = require("../models"); // Sequelize 모델 가져오기
const { Op } = require("sequelize");

// 🎫 특정 예약 정보 조회 (reservationNumber 기준)
const getTicketData = async (ticketId) => {
  try {
    const orderData = await db.Tickets.findOne({
      where: { id: ticketId },
      include: [
        { model: db.Seats, attributes: ["seatNumber", "class", "price", "status"] },
        { model: db.Flights, attributes: ["flightName"] }
      ],
    });

    if (!orderData) return null; // 예약 정보 없음
    return orderData;
  } catch (error) {
    console.error("❌ 주문 정보 조회 오류:", error);
    throw new Error("주문 정보를 조회하는 중 오류 발생");
  }
};
  
  // 🎫 주문 상태 업데이트 (예: "PENDING" -> "PAID")
const updateTicketStatus = async (orderedTicketId, newStatus) => {
try {
    const ticket = await db.Tickets.findOne({ where: { id: orderedTicketId } });

    if (!ticket) return false;

    ticket.status = newStatus;
    await ticket.save();
    return true;
} catch (error) {
    console.error("❌ 주문 상태 업데이트 오류:", error);
    throw new Error("주문 상태 업데이트 중 오류 발생");
}
};

module.exports = {
    getTicketData,
    updateTicketStatus
}
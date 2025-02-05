const cron = require("node-cron");
const db = require("../models");
const sendEmail = require("../utils/sendEmail");
const { TicketStatus } = require("../common/StatusEnums");

// 스케줄러: 매분 실행
cron.schedule("* * * * *", async () => {
  try {
    //console.log("Running ticket reminder job...");

    const now = new Date();
    console.log(now);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    // 출발 시간이 1시간 이내인 티켓 조회
    const tickets = await db.Tickets.findAll({
      include: [
        {
          model: db.Flights,
          //as: "flight",
          attributes: ["departureTime", "flightName"],
        },
        {
          model: db.Users,
          attributes: ["email"], // 사용자 이메일
        },
      ],
      where: {
        "$Flight.departure_time$": [oneHourLater],
        status: TicketStatus.Confirmed
      },
    });

    // 이메일 알림 발송
    for (const ticket of tickets) {
      const email = ticket.User.email;
      const departureTime = ticket.Flight.departureTime;
      const flightName = ticket.Flight.flightName;

      const message = `
        Hello,
        This is a reminder that your 
        flight: ${flightName} 
        is departing soon.
        Flight Departure Time: ${departureTime}.
      `;

      await sendEmail(email, "Flight Reminder", message);
    }
  } catch (error) {
    console.error("Error running ticket reminder job:", error.message);
  }
});

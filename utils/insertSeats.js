const { Flights, Seats } = require("../models");

const insertSeats = async () => {
  try {
    // 모든 항공편 데이터를 가져옵니다
    const flights = await Flights.findAll();

    if (!flights || flights.length === 0) {
      console.log("No flights found. Please insert flights first.");
      return;
    }

    // 좌석 데이터를 저장할 배열
    const seatsData = [];

    // 각 항공편에 대해 10개의 좌석을 생성합니다
    flights.forEach((flight) => {
      for (let i = 1; i <= 10; i++) {
        seatsData.push({
          flightId: flight.id, // 항공편 ID
          seatNumber: `A${i}`, // 좌석 번호 (예: A1, A2, ...)
          class: i <= 5 ? "Economy" : "Business", // 좌석 클래스
          status: "Available", // 초기 상태는 "Available"
          price: i <= 5 ? 100 : 200, // Economy는 100, Business는 200
        });
      }
    });

    // 좌석 데이터를 한 번에 삽입합니다
    await Seats.bulkCreate(seatsData);

    console.log("Seats inserted successfully!");
  } catch (error) {
    console.error("Error inserting seats:", error);
  }
};

insertSeats();

const { Op } = require("sequelize"); // Sequelize에서 Op를 임포트
const db = require("../models");

const searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, passengers } =
      req.body;

    if (!origin || !destination || !departureDate || !passengers) {
      return res
        .status(400)
        .json({
          error:
            "필수 항목(origin, destination, departureDate, passengers)이 누락되었습니다.",
        });
    }

    // 출발 공항 정보 조회
    const originAirport = await db.Airports.findOne({ where: { code: origin } });
    const destinationAirport = await db.Airports.findOne({
      where: { code: destination },
    });

    if (!originAirport || !destinationAirport) {
      return res
        .status(404)
        .json({
          error:
            "입력된 origin 또는 destination 코드에 해당하는 공항이 없습니다.",
        });
    }

    // 출발 항공편 검색 조건
    const departureConditions = {
      departureAirportId: originAirport.id,
      arrivalAirportId: destinationAirport.id,
      departureTime: {
        [Op.gte]: new Date(departureDate), // 출발 날짜는 요청된 날짜 이후
        [Op.lt]: new Date(
          new Date(departureDate).setDate(
            new Date(departureDate).getDate() + 1,
          ),
        ), // 요청 날짜의 하루 후
      },
    };

    // 출발 항공편 검색
    const departureFlights = await db.Flights.findAll({
      where: departureConditions,
      include: [
        {
          model: db.Airports,
          as: "departureAirport",
          attributes: ["code"],
        },
        {
          model: db.Airports,
          as: "arrivalAirport",
          attributes: ["code"],
        },
      ],
      order: [["departureTime", "ASC"]],
    });

    let returnFlights = [];
    if (returnDate) {
      const returnConditions = {
        departureAirportId: destinationAirport.id,
        arrivalAirportId: originAirport.id,
        departureTime: {
          [Op.gte]: new Date(returnDate),
          [Op.lt]: new Date(
            new Date(returnDate).setDate(new Date(returnDate).getDate() + 1),
          ),
        },
      };

      returnFlights = await db.Flights.findAll({
        where: returnConditions,
        order: [["departureTime", "ASC"]],
        include: [
          {
            model: db.Airports,
            as: "departureAirport",
            attributes: ["name", "city", "code"],
          },
          {
            model: db.Airports,
            as: "arrivalAirport",
            attributes: ["name", "city", "code"],
          },
        ],
      });
    }

    res.json({
      departureFlights,
      returnFlights: returnDate ? returnFlights : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "항공편 검색 중 문제가 발생했습니다." });
  }
};

const getFlightDetails = async (req, res) => {
  try {
    const { flightId } = req.params; // URL 파라미터에서 flightId 추출

    if (!flightId) {
      return res.status(400).json({ error: "flightId가 누락되었습니다." });
    }
    // 항공편 조회
    const flight = await db.Flights.findOne({
      where: { id: flightId }, // flightId로 항공편 조회
      include: [
        {
          model: db.Airports,
          as: "departureAirport",
          attributes: ["code"], // 출발 공항 코드만 필요
        },
        {
          model: db.Airports,
          as: "arrivalAirport",
          attributes: ["code"], // 도착 공항 코드만 필요
        },
      ],
    });

    if (!flight) {
      return res.status(404).json({ error: "해당 항공편을 찾을 수 없습니다." });
    }

    // 항공편 정보 반환
    return res.json({
      flightId: flight.flightname,
      airline: flight.airline,
      origin: flight.departureAirport.code, // 출발 공항 코드
      destination: flight.arrivalAirport.code, // 도착 공항 코드
      departureTime: flight.departureTime.toISOString(), // ISO 형식으로 변환
      arrivalTime: flight.arrivalTime.toISOString(), // ISO 형식으로 변환
      status: flight.status,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "항공편 정보를 조회하는 중 오류가 발생했습니다." });
  }
};
module.exports = {
  searchFlights,
  getFlightDetails,
};

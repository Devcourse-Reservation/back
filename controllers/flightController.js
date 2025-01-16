const { Op } = require('sequelize');  // Sequelize에서 Op를 임포트
const Flight = require('../models/Flight');

const searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, passengers, class : flightClass } = req.body;
    if (!origin || !destination || !departureDate || !passengers) {
      return res.status(400).json({ error: '필수 항목(origin, destination, departureDate, passengers)이 누락되었습니다.'});
    }
    // 출발 항공편 검색 조건
    const departureConditions = {
      origin,
      destination,
      departureTime: {
        [Op.gte]: new Date(departureDate), // 출발 날짜는 요청된 날짜 이후
        [Op.lt]: new Date(new Date(departureDate).setDate(new Date(departureDate).getDate() + 1)), // 요청 날짜의 하루 후
      },
    };
    
    if (flightClass) {
      departureConditions.class = flightClass;
    }

    // 출발 항공편 검색
    const departureFlights = await Flight.findAll({
      where: departureConditions,
      order: [['departureTime', 'ASC']],
    });

    let returnFlights = [];
    if (returnDate) {
      const returnConditions = {
        origin: destination,
        destination: origin,
        departureTime: {
          [Op.gte]: new Date(returnDate),
          [Op.lt]: new Date(new Date(returnDate).setDate(new Date(returnDate).getDate() + 1)),
        },
      };

      if (flightClass) {
        returnConditions.class = flightClass;
      }

      returnFlights = await Flight.findAll({
        where: returnConditions,
        order: [['departureTime', 'ASC']],
      });
    }
    res.json({
      departureFlights,
      returnFlights: returnDate ? returnFlights : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '항공편 검색 중 문제가 발생했습니다.' });
  }
}

// const flightDetail = (req, res) => {

// }

module.exports = {
    searchFlights,
    //flightDetail,
  };
  
const Flight = require('../models/Flight'); // Flight 모델 가져오기

(async () => {
  try {
    const flights = [
      {
        airline: 'Korean Air',
        origin: 'ICN',
        destination: 'JFK',
        departureTime: '2025-01-20 10:00:00',
        arrivalTime: '2025-01-20 14:00:00',
        price: 1200.0,
        duration: '14h 0m',
        seatsAvailable: 50,
        class: 'economy',
      },
      {
        airline: 'Asiana Airlines',
        origin: 'ICN',
        destination: 'LAX',
        departureTime: '2025-01-21 12:00:00',
        arrivalTime: '2025-01-21 16:00:00',
        price: 1100.0,
        duration: '11h 0m',
        seatsAvailable: 30,
        class: 'business',
      },
      {
        airline: 'Delta Airlines',
        origin: 'ICN',
        destination: 'ORD',
        departureTime: '2025-01-22 08:00:00',
        arrivalTime: '2025-01-22 12:00:00',
        price: 900.0,
        duration: '13h 0m',
        seatsAvailable: 45,
        class: 'economy',
      },
      // 돌아오는 항공편
    {
      airline: 'Korean Air',
      origin: 'JFK',
      destination: 'ICN',
      departureTime: '2025-01-25 15:00:00',
      arrivalTime: '2025-01-26 19:00:00',
      price: 1250.0,
      duration: '14h 0m',
      seatsAvailable: 40,
      class: 'economy',
    },
    {
      airline: 'Asiana Airlines',
      origin: 'LAX',
      destination: 'ICN',
      departureTime: '2025-01-26 14:00:00',
      arrivalTime: '2025-01-27 18:00:00',
      price: 1150.0,
      duration: '11h 0m',
      seatsAvailable: 25,
      class: 'business',
    },
    {
      airline: 'Delta Airlines',
      origin: 'ORD',
      destination: 'ICN',
      departureTime: '2025-01-27 09:00:00',
      arrivalTime: '2025-01-28 13:00:00',
      price: 950.0,
      duration: '13h 0m',
      seatsAvailable: 35,
      class: 'economy',
    },
  ];

    await Flight.bulkCreate(flights);
    console.log('Flights inserted successfully.');
  } catch (error) {
    console.error('Error inserting flights:', error);
  }
})();
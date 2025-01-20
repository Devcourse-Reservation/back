const Flights = require('../models/Flight');

const insertFlights = async () => {
  try {
    await Flights.bulkCreate([
      {
        flightNumber: 'AA101',
        airline: 'American Airlines',
        status: 'Scheduled',
        departureAirportId: 1, // LAX
        arrivalAirportId: 2, // JFK
        departureTime: '2025-01-20 08:00:00',
        arrivalTime: '2025-01-20 16:00:00',
      },
      {
        flightNumber: 'DL202',
        airline: 'Delta Airlines',
        status: 'Scheduled',
        departureAirportId: 2, // JFK
        arrivalAirportId: 3, // SFO
        departureTime: '2025-01-21 09:00:00',
        arrivalTime: '2025-01-21 12:30:00',
      },
      {
        flightNumber: 'UA303',
        airline: 'United Airlines',
        status: 'Delayed',
        departureAirportId: 3, // SFO
        arrivalAirportId: 4, // ORD
        departureTime: '2025-01-22 14:00:00',
        arrivalTime: '2025-01-22 18:00:00',
      },
      {
        flightNumber: 'KE404',
        airline: 'Korean Air',
        status: 'Scheduled',
        departureAirportId: 5, // ICN
        arrivalAirportId: 1, // LAX
        departureTime: '2025-01-23 11:00:00',
        arrivalTime: '2025-01-23 20:00:00',
      },
      {
        flightNumber: 'AA505',
        airline: 'American Airlines',
        status: 'Cancelled',
        departureAirportId: 4, // ORD
        arrivalAirportId: 5, // ICN
        departureTime: '2025-01-24 18:00:00',
        arrivalTime: '2025-01-25 08:00:00',
      },
    ]);

    console.log('Flights inserted successfully!');
  } catch (error) {
    console.error('Error inserting flights:', error);
  }
};

insertFlights();
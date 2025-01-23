const { Flights } = require("../models");

const insertFlights = async () => {
  try {
    await Flights.bulkCreate([
      // 기존 항공편
      {
        flightName: "AA101",
        airline: "American Airlines",
        status: "Scheduled",
        departureAirportId: 1, // LAX
        arrivalAirportId: 2, // JFK
        departureTime: "2025-01-20 08:00:00",
        arrivalTime: "2025-01-20 16:00:00",
      },
      {
        flightName: "DL202",
        airline: "Delta Airlines",
        status: "Scheduled",
        departureAirportId: 2, // JFK
        arrivalAirportId: 3, // SFO
        departureTime: "2025-01-21 09:00:00",
        arrivalTime: "2025-01-21 12:30:00",
      },
      {
        flightName: "UA303",
        airline: "United Airlines",
        status: "Delayed",
        departureAirportId: 3, // SFO
        arrivalAirportId: 4, // ORD
        departureTime: "2025-01-22 14:00:00",
        arrivalTime: "2025-01-22 18:00:00",
      },
      {
        flightName: "KE404",
        airline: "Korean Air",
        status: "Scheduled",
        departureAirportId: 5, // ICN
        arrivalAirportId: 1, // LAX
        departureTime: "2025-01-23 11:00:00",
        arrivalTime: "2025-01-23 20:00:00",
      },
      {
        flightName: "AA505",
        airline: "American Airlines",
        status: "Cancelled",
        departureAirportId: 4, // ORD
        arrivalAirportId: 5, // ICN
        departureTime: "2025-01-24 18:00:00",
        arrivalTime: "2025-01-25 08:00:00",
      },

      // 돌아오는 항공편
      {
        flightName: "AA102",
        airline: "American Airlines",
        status: "Scheduled",
        departureAirportId: 2, // JFK
        arrivalAirportId: 1, // LAX
        departureTime: "2025-01-25 18:00:00",
        arrivalTime: "2025-01-25 22:00:00",
      },
      {
        flightName: "DL203",
        airline: "Delta Airlines",
        status: "Scheduled",
        departureAirportId: 3, // SFO
        arrivalAirportId: 2, // JFK
        departureTime: "2025-01-26 14:00:00",
        arrivalTime: "2025-01-26 17:30:00",
      },
      {
        flightName: "UA304",
        airline: "United Airlines",
        status: "Delayed",
        departureAirportId: 4, // ORD
        arrivalAirportId: 3, // SFO
        departureTime: "2025-01-27 19:00:00",
        arrivalTime: "2025-01-27 23:00:00",
      },
      {
        flightName: "KE405",
        airline: "Korean Air",
        status: "Scheduled",
        departureAirportId: 1, // LAX
        arrivalAirportId: 5, // ICN
        departureTime: "2025-01-27 21:00:00",
        arrivalTime: "2025-01-28 05:00:00",
      },
      {
        flightName: "AA506",
        airline: "American Airlines",
        status: "Cancelled",
        departureAirportId: 5, // ICN
        arrivalAirportId: 4, // ORD
        departureTime: "2025-01-25 09:00:00",
        arrivalTime: "2025-01-25 21:00:00",
      },
    ]);

    console.log("Flights inserted successfully!");
  } catch (error) {
    console.error("Error inserting flights:", error);
  }
};

insertFlights();

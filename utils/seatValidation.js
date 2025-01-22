const { SeatStatus } = require("../common/StatusEnums");

const validateSeats = (seatIds, seats) => {
  const notFoundSeats = seatIds.filter(
    (seatId) => !seats.some((seat) => seat.id === seatId)
  );

  const errorMessages = [];
  if (notFoundSeats.length > 0) {
    errorMessages.push(`Seats not found: ${notFoundSeats.join(", ")}`);
  }

  if (errorMessages.length > 0) {
    throw new Error(errorMessages.join(" | "));
  }
};

module.exports = { validateSeats };

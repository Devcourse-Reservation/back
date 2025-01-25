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

const validateSeatFields = (seats) => {
  const hasInvalidSeat = seats.some(
    (seat) => !seat.seatNumber || !seat.class || !seat.price
  );
  if (hasInvalidSeat) {
    throw new Error("Each seat must include seatNumber, class, and price.");
  }
};

const validateSeatsArray = (seats) => {
  if (!Array.isArray(seats) || seats.length === 0) {
    const error = new Error("Seats data is required and should be an array.");
    error.statusCode = StatusCodes.BAD_REQUEST;
    throw error;
  }
};

module.exports = { validateSeats, validateSeatFields, validateSeatsArray };

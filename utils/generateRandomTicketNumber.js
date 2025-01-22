const crypto = require("crypto");

function generateRandomTicketNumber(flightName, seatId) {
  const now = new Date();

  const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
  const timePart = now.toTimeString().slice(0, 8);
  const milliseconds = now.getMilliseconds().toString().padStart(3, "0");

  const time = `${timePart}:${milliseconds}`;

  const hash = crypto
    .createHash("sha256")
    .update(time)
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();
  return `${flightName}${datePart}${hash}${seatId}`;
}

module.exports = {
  generateRandomTicketNumber,
};

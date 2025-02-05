const SeatStatus = Object.freeze({
  Available: "Available",
  Reserved: "Reserved",
  Blocked: "Blocked",
});

const TicketStatus = Object.freeze({
  Confirmed: "Confiremd",
  Pending: "Pending",
  Cancelled: "Cancelled",
});

const FlightStatus = Object.freeze({
  Schedule: "Schedule",
  Cancelled: "Cancelled",
  Delayed: "Delayed",
});

const PaymentStatus = Object.freeze({
  Paid: "Paid",
  Pending: "Pending",
  Refunded: "Refunded",
});

module.exports = {
  SeatStatus,
  TicketStatus,
  FlightStatus,
  PaymentStatus
};

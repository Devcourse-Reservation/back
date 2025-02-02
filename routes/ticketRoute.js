const express = require("express");
const {
  getTicketByTicketId,
  getTicketsByUserId,
  postTickets,
} = require("../controllers/ticketsController");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwtMiddleware");

router.use(express.json());

module.exports = (io) => {
  router.get("/:ticketId", verifyToken, getTicketByTicketId);
  router.get("/", verifyToken, getTicketsByUserId);
  router.post("/", verifyToken, (req, res) => postTickets(req, res, io));

  return router;
};

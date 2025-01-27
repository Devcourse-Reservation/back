const express = require("express");
const { 
    getTicketByTicketId,
    getTicketsByUserId,
    postTickets
 } = require("../controllers/ticketsController");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwtMiddleware");

router.use(express.json());

router.get("/:ticketId", verifyToken, getTicketByTicketId);
router.get("/", verifyToken, getTicketsByUserId);
router.post("/", verifyToken, postTickets);

module.exports = router;

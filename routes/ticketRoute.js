const express = require("express");
const { 
    getTicketByTicketId,
    getTicketsByUserId,
    postTickets
 } = require("../controllers/ticketsController");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwtMiddleware");

router.use(express.json());
router.use(verifyToken);

router.get("/:ticketId", getTicketByTicketId);
router.get("/", getTicketsByUserId);
router.post("/", postTickets);

module.exports = router;

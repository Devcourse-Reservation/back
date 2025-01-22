const express = require("express");
const { getTicketByTicketId } = require("../controller/ticketsController");

const router = express.Router();
router.use(express.json());

router.get("/:ticketId", getTicketByTicketId);
module.exports = router;

const express = require("express");
const { getTicketsByUserId } = require("../controller/ticketsController");

const router = express.Router();
router.use(express.json());

router.get("/", getTicketsByUserId);
module.exports = router;

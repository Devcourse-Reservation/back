const express = require("express");
const { postTickets } = require("../controller/ticketsController");

const router = express.Router();
router.use(express.json());

router.post("/", postTickets);

module.exports = router;

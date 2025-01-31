const express = require("express");
const { postTickets } = require("../controllers/ticketsController");

const router = express.Router();
router.use(express.json());

module.exports = (io) => {
  router.post("/", (req, res) => postTickets(req, res, io));
  return router;
};

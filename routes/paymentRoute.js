const express = require("express");
const { 
    completePayment,
    refundPayment
 } = require("../controllers/paymentController");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwtMiddleware");

router.use(express.json());

module.exports = (io) => {
  router.post("/complete", completePayment);
  router.post("/refund", (req, res) =>
    refundPayment(req, res, io)
  );
  return router;
};

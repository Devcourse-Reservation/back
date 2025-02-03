const express = require("express");
const {
  completePayment,
  postPayment,
  refundPayment,
} = require("../controllers/paymentController");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwtMiddleware");

router.use(express.json());

module.exports = (io) => {
  router.post("/complete", verifyToken, completePayment);
  router.post("/:paymentId", verifyToken, postPayment);
  router.post("/refund", verifyToken, (req, res) =>
    refundPayment(req, res, io)
  );
  return router;
};

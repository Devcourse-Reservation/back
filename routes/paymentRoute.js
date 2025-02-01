const express = require("express");
const {
  //   completePayment,
  //   postPayment,
  refundPayment,
} = require("../controllers/paymentController");
const router = express.Router();
// const { verifyToken } = require("../middlewares/jwtMiddleware");

router.use(express.json());

// router.post("/complete", verifyToken, completePayment);
// router.post("/:paymentId", verifyToken, postPayment);

module.exports = (io) => {
    router.post("/refund", (req, res) => refundPayment(req, res, io));
    return router;
  };

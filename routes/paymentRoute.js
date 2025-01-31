const express = require("express");
const { 
    completePayment,
    postPayment,
    //refundPayment
 } = require("../controllers/paymentsController");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwtMiddleware");

router.use(express.json());

router.post("/complete", verifyToken, completePayment);
router.post("/:paymentId", verifyToken, postPayment);
//router.delete("/refund", refundPayment);

module.exports = router;

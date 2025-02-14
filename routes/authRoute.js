const express = require("express");
const passport = require("../passport/passport");
const { 
  createToken,
  adminRequest, 
  verifyAdmin,
  checkMe,
  newToken,
  logout,
 } = require("../controllers/authController");
const router = express.Router();
const { verifyToken } = require("../middlewares/jwtMiddleware");


router.use(passport.initialize());

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["email", "https://www.googleapis.com/auth/userinfo.profile"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google",
  }),
  createToken,
);

router.get(
  "/kakao", 
  passport.authenticate("kakao"),
);

router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    session: false,
    failureRedirect: "/auth/kakao",
  }),
  createToken, 
);

router.get(
  "/naver",
  passport.authenticate("naver", { scope: ["email", "name", "mobile"] }),
);

router.get(
  "/naver/callback",
  passport.authenticate("naver", {
    session: false,
    failureRedirect: "/auth/naver",
  }),
  createToken,
);

router.get("/me", verifyToken, checkMe);

router.post("/refresh", newToken);

router.post("/logout", verifyToken, logout);

router.post("/admin", verifyToken, adminRequest);

router.post("/verify", verifyToken, verifyAdmin);

module.exports = router;

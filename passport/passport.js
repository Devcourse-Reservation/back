const passport = require("passport");
const googleStrategy = require("./googleStrategy");
const kakaoStrategy = require("./kakaoStrategy");
const naverStrategy = require("./naverStrategy");

passport.use("google", googleStrategy);
passport.use("kakao", kakaoStrategy);
passport.use("naver", naverStrategy);

module.exports = passport;

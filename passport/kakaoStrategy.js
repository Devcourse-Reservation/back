const KakaoStrategy = require("passport-kakao").Strategy;
const dotenv = require("dotenv");
const { findOrCreateUser } = require("../controllers/authController");

dotenv.config({ path: "back/.env" });

const kakaoStrategy = new KakaoStrategy(
  {
    clientID: process.env.KAKAO_CLIENT_ID,
    clientSecret: process.env.KAKAO_CLIENT_SECRET,  // 선택 사항
    callbackURL: process.env.KAKAO_REDIRECT_URL,
  },
  async (oauthAccessToken, refreshToken, profile, cb) => {
    const email = profile._json.kakao_account.email;
    const provider = profile.provider;
    const phoneNumber = profile.phone_number;
    const name = profile.username;
    
    if (!email) {
      return cb(new Error("No email found in profile"));
    }

    const user = await findOrCreateUser(email, provider, phoneNumber, name);
    if (!user) {
      return cb(null, false);
    }

    return cb(null, user);
  },
);

module.exports = kakaoStrategy;

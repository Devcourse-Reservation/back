const NaverStrategy = require("passport-naver").Strategy;
const dotenv = require("dotenv");
const { findOrCreateUser } = require("../controllers/authController");

dotenv.config({ path: "back/.env" });

const naverStrategy = new NaverStrategy(
  {
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: process.env.NAVER_REDIRECT_URL,
  },
  async (accessToken, refreshToken, profile, cb) => {
    const email = profile._json.email;
    const provider = profile.provider;
    const phoneNumber = profile.phone_number;
    const name = profile.displayName;

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

module.exports = naverStrategy;

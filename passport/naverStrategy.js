const NaverStrategy = require("passport-naver").Strategy;
const dotenv = require("dotenv");
const { findOrCreateUser } = require("../controllers/authController");
const axios = require("axios");

//dotenv.config({ path: "flights-back/config/.env" });

const naverStrategy = new NaverStrategy(
  {
    clientID: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackURL: process.env.NAVER_REDIRECT_URL,
  },
  async (oauthAccessToken, refreshToken, profile, cb) => {
    const email = profile._json.email;
    const provider = profile.provider;
    const [name, phoneNumber] = await getNaverInfo(oauthAccessToken);
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
async function getNaverInfo(oauthAccessToken) {
  try {
    const response = await axios.get("https://openapi.naver.com/v1/nid/me", {
      headers: {
        Authorization: `Bearer ${oauthAccessToken}`,
      },
    });
    const phoneNumber = response.data.response.mobile || null;
    const name = response.data.response.name || null;
    return [name, phoneNumber];
  } catch (error) {
    console.error(
      "Failed to fetch phone number from Naver API:",
      error.response?.data || error.message,
    );
    return null;
  }
}

module.exports = naverStrategy;

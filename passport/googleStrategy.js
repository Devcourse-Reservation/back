const GoogleStrategy = require("passport-google-oauth20");
const dotenv = require("dotenv");
const { findOrCreateUser } = require("../controllers/authController");
const axios = require("axios");

//dotenv.config({ path: "flights-back/config/.env" });

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URL,
    scope: ["email", "https://www.googleapis.com/auth/userinfo.profile"],
  },
  async (oauthAccessToken, refreshToken, profile, cb) => {
    const email = profile.emails[0]?.value;
    const provider = profile.provider;
    const phoneNumber = await getPhoneNumber(oauthAccessToken);
    const name = profile.username || profile.displayName;

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

async function getPhoneNumber(oauthAccessToken) {
  try {
    const response = await axios.get(
      "https://people.googleapis.com/v1/people/me",
      {
        headers: {
          Authorization: `Bearer ${oauthAccessToken}`, // OAuth 2.0 Access Token
        },
        params: {
          personFields: "phoneNumbers", // 필요한 데이터 필드 지정
        },
      },
    );
    const phoneNumbers = response.data.phoneNumbers || [];
    return phoneNumbers.length > 0 ? phoneNumbers[0].value : null; // 첫 번째 전화번호 반환
  } catch (error) {
    console.error(
      "Failed to fetch phone number:",
      error.response?.data || error.message,
    );
    return null;
  }
}

module.exports = googleStrategy;

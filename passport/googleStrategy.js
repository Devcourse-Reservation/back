const GoogleStrategy = require("passport-google-oauth20");
const dotenv = require("dotenv");
const { findOrCreateUser } = require("../controllers/authController");

dotenv.config({ path: "./src/config/.env" });

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URL,
    scope: ["email", "https://www.googleapis.com/auth/user.phonenumbers.read"],
  },
  async (accessToken, refreshToken, profile, cb) => {
    const email = profile.emails[0].value;
    const provider = profile.provider;
    const phoneNumber = profile.phone_number;
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

module.exports = googleStrategy;

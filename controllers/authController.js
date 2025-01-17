const db = require("../models");
const User = db.User;
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "./src/config/.env" });

const findOrCreateUser = async (email, provider, phone_number, name) => {
  const phone = phone_number || ""; 
  const userName = name || "";
  try {
    const [user, created] = await User.findOrCreate({
      where: { email, provider: provider },
      defaults: {
        email,
        phone_number: phone,
        provider,
        name: userName,
      },
    });

    return user; 
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);
    throw error;
  }
};

const createToken = (req, res) => {
  const user = req.user;
  const payload = {
    id: user.id,
    email: user.email,
  };
  const options = {
    subject: "user",
    expiresIn: "3m",
    issuer: process.env.JWT_ISSUER,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, options);

  res.cookie("accessToken", token);
  res.status(StatusCodes.OK).end();
};

module.exports = { findOrCreateUser, createToken };

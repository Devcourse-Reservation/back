const db = require("../models");
const User = db.Users;
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "back/.env" });

const findOrCreateUser = async (email, provider, phone_number, name) => {
  const phone = phone_number || "";
  const userName = name || "";
  try {
    const [user, created] = await User.findOrCreate({
      where: { email, provider: provider },
      defaults: {
        email,
        phoneNumber: phone,
        provider,
        name: userName,
      },
    });
    if (created) {
      console.log("New user created:", user.email);
    } else {
      console.log("Existing user found:", user.email);
    }
    return user;
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);
    throw error;
  }
};

const createToken = (req, res) => {
  const user = req.user;

  const accessPayload = {
    id: user.id,
    email: user.email,
    userType: user.userType,
  };
  const refreshPayload = {
    id: user.id,
  };
  
  const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET, {
    subject: "user",
    expiresIn: "10m",
    issuer: process.env.JWT_ISSUER,
  });
  console.log("Access Token:", accessToken);

  const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET, {
    subject: "user",
    expiresIn: "7d", // 7 days
    issuer: process.env.JWT_ISSUER,
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });

  res.status(StatusCodes.OK).end();
};



module.exports = { findOrCreateUser, createToken };

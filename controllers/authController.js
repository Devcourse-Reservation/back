const db = require("../models");
const User = db.Users;
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const sendEmail = require("../utils/sendEmail");


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

const adminCode = new Map();

const adminRequest = async (req, res) => {
  const userId = req.userId;
  const email = req.userEmail;
  //console.log(req.user, req.userEmail, req.userId);

  try {
    const user = await User.findByPk(userId);

    if (!user || user.email !== email) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found or email mismatch" });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6자리 코드
    adminCode.set(userId, verificationCode);
    // 이메일 전송 로직 추가
    await sendEmail(
      email,
      "Admin Approval Request",
      `Your verification code is ${verificationCode}`
    );

    res.status(StatusCodes.OK).json({ message: "Verification code sent to your email" });
  } catch (error) {
    console.error("Error requesting admin approval:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to request approval" });
  }
};

const verifyAdmin = async (req, res) => {
  const userId = req.userId
  const { verificationCode } = req.body;

  try {

    const user = await User.findByPk(userId);
    const storedCode = adminCode.get(userId);
    console.log(storedCode);
    if (!user || !storedCode || storedCode !== verificationCode) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Invalid verification code" });
    }

    user.userType = "admin";
    await user.save();

    res.status(StatusCodes.OK).json({ message: "User promoted to admin successfully" });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to verify code" });
  }
};


module.exports = { findOrCreateUser, createToken, adminRequest, verifyAdmin };

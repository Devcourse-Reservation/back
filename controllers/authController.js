const db = require("../models");
const User = db.Users;
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const sendEmail = require("../utils/sendEmail");
const Redis = require("ioredis");
const redis = new Redis(); // 기본적으로 localhost:6379


//dotenv.config({ path: "flights-back/config/.env" });

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
    sameSite: "lax",
    secure: false,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  res.redirect(`${process.env.CORS_ORIGIN}/auth/callback`); // 프론트엔드 홈 화면 URL
};

const newToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No Refresh Token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    // DB 등에서 사용자를 찾음
    const user = await User.findByPk(decoded.id);
    if (!user) throw new Error("User not found");

    // 새 Access Token 발급
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { 
        subject: "user",
        expiresIn: "10m",
        issuer: process.env.JWT_ISSUER, 
      }
    );
    // 쿠키에 저장
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.json({ message: "Access token refreshed" });
  } catch (error) {
    return res.status(403).json({ message: "Invalid Refresh Token" });
  }
}

const logout = (req, res) => {
  res.clearCookie("accessToken"); // AccessToken 삭제
  res.clearCookie("refreshToken"); // RefreshToken 삭제
  // JSON 응답
  res.status(200).json({ message: "로그아웃 성공" });
}

const checkMe = (req, res) => {
  try {
    const userId = req.userId; // `verifyToken` 미들웨어에서 `req.user` 설정됨
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "인증되지 않은 사용자" });
    }
    res.status(StatusCodes.OK).json({ id: userId });
  } catch (error) {
    console.error("🚨 /auth/me 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};


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
    await redis.setex(`admin_code:${userId}`, 300, verificationCode);
    // 이메일 전송 로직 추가
    await sendEmail(
      email,
      `${user.name}'s Admin Approval Request`,
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
    const storedCode = await redis.get(`admin_code:${userId}`);
    if (!storedCode || storedCode !== verificationCode) {
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

module.exports = { findOrCreateUser, createToken, checkMe, newToken, adminRequest, verifyAdmin, logout };

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

  const accessPayload = {
    id: user.id,
    email: user.email,
  };
  // const refreshPayload = {
  //   id: user.id,
  // };
  
  const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET, {
    subject: "user",
    expiresIn: "10m",
    issuer: process.env.JWT_ISSUER,
  });
  // const refreshToken = jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET, {
  //   subject: "user",
  //   expiresIn: "7d", // 7 days
  //   issuer: process.env.JWT_ISSUER,
  // });

  // user.refreshToken = refreshToken;
  // user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });
  // res.cookie("refreshToken", refreshToken, {
  //   httpOnly: true,
  //   sameSite: "strict",
  //   secure: true,
  // });

  res.status(StatusCodes.OK).end();
};

// const refreshAccessToken = async (req, res) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     return res
//       .status(StatusCodes.UNAUTHORIZED)
//       .json({ message: "Refresh token missing." });
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

//     // Retrieve the user and validate the refresh token
//     const user = await User.findOne({ where: { id: decoded.id, refreshToken } });

//     if (!user) {
//       return res
//         .status(StatusCodes.UNAUTHORIZED)
//         .json({ message: "Invalid refresh token." });
//     }

//     const accessToken = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET,
//       {
//         subject: "user",
//         expiresIn: "5m",
//         issuer: process.env.JWT_ISSUER,
//       }
//     );

//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       sameSite: "strict",
//       secure: true,
//     });

//     res.status(StatusCodes.OK).end();
//   } catch (error) {
//     res
//       .status(StatusCodes.UNAUTHORIZED)
//       .json({ message: "Invalid or expired refresh token." });
//   }
// };

module.exports = { findOrCreateUser, createToken };

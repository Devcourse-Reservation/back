const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models").Users;
const { StatusCodes } = require("http-status-codes");

dotenv.config({ path: "flights-back/config/.env" });

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Access Token missing" });
  }

  const decoded = verifyAccessToken(token);
  if (decoded) {
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userType = decoded.userType;
    return next();
  }

  // Handle expired access token
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Refresh Token missing" });
  }

  try {
    const user = await verifyRefreshToken(refreshToken);
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      {
        subject: "user",
        expiresIn: "10m",
        issuer: process.env.JWT_ISSUER,
      }
    );
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    req.userId = user.id;
    req.userEmail = user.email;
    req.userType = user.userType;
    return next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
  }
};

const verifyRefreshToken = async (refreshToken) => {
  try {
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); 
    const user = await User.findOne({ where: { id: decodedRefresh.id } });
    if (!user) throw new Error("User not found");
    return user;
  } catch (error) {
    throw new Error("Invalid or expired Refresh Token");
  }
};

module.exports = {
  verifyToken,
};

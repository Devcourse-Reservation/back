const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { StatusCodes } = require("http-status-codes");

//dotenv.config({ path: "flights-back/config/.env" });

const verifyToken = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken ) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Access Token missing" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    //console.log(decoded);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userType = decoded.userType;
    next();
  } catch (error) {
    // accessToken 만료 등
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token expired or invalid" });
  }
};


module.exports = {
  verifyToken,
};

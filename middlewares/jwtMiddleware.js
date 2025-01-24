const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { StatusCodes } = require("http-status-codes");

dotenv.config({ path: "back/.env" });

const verifyToken = (req, res, next) => {
  let token;
  if (req.header("Authorization"))
    token = req.header("Authorization").split(" ")[1];

  if (!token) return res.status(StatusCodes.UNAUTHORIZED).end();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    // 여기서 이메일 사용
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token expired" });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid token" });
  }
};

module.exports = {
  verifyToken,
};

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
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).end();
  }
};

module.exports = {
  verifyToken,
};

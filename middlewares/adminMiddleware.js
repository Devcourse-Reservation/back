const { StatusCodes } = require("http-status-codes");

const verifyAdmin = (req, res, next) => {
  if (req.userType !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Admin access only" });
  }
  next();
};

module.exports = { verifyAdmin };
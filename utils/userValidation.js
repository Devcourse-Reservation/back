const validateUserType = (user) => {
  if (user.userType !== "admin") {
    throw new Error("접근 권한이 없습니다.");
  }
};

module.exports = {
  validateUserType,
};

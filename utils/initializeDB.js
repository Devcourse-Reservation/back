const { sequelize } = require("../models");

const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // 모든 테이블 삭제 후 재생성
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await sequelize.close(); // 연결 종료
  }
};

initializeDatabase();
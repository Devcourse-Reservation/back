module.exports = (sequelize, DataTypes) => {
  const Seats = sequelize.define("Seats", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    flight_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    seat_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    class: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "seats", // 실제 테이블 이름과 일치
    timestamps: false, // created_at, updated_at 자동 생성 없이 사용
  }
  );
  return Seats;
};

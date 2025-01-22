module.exports = (sequelize, DataTypes) => {
  const Seats = sequelize.define(
    "Seats",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      flightId: {
        type: DataTypes.BIGINT,
        field: "flight_id",
        allowNull: false,
      },
      seatNumber: {
        type: DataTypes.STRING,
        field: "seat_number",
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
  Seats.associate = (models) => {
    Seats.hasMany(models.Tickets, {
      foreignKey: "seatId",
      sourceKey: "id",
    });
  };
  return Seats;
};

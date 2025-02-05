module.exports = (sequelize, DataTypes) => {
  const Seats = sequelize.define(
    "Seats", {
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
  },
  {
    tableName: "seats",
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
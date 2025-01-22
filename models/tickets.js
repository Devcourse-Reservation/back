module.exports = (sequelize, DataTypes) => {
  const Tickets = sequelize.define(
    "Tickets",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.BIGINT,
        field: "user_id",
        allowNull: false,
      },
      flightId: {
        type: DataTypes.BIGINT,
        field: "flight_id",
        allowNull: false,
      },
      seatId: {
        type: DataTypes.BIGINT,
        field: "seat_id",
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reservationNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "reservation_number",
        unique: true,
      },
      reservedAt: {
        type: DataTypes.DATE,
        field: "reserved_at",
        allowNull: false,
      },
      cancelledAt: {
        type: DataTypes.DATE,
        field: "cancelled_at",
        allowNull: true,
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
      tableName: "tickets",
      timestamps: false,
    }
  );

  Tickets.associate = (models) => {
    Tickets.belongsTo(models.Flights, {
      foreignKey: "flightId",
      targetKey: "id",
    });
  };
  return Tickets;
};

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
      ticketType: {
        type: DataTypes.STRING,
        field: "ticket_type",
        allowNull: false,
      },
      reservedAt: {
        type: DataTypes.DATE,
        field: "reserved_at",
        allowNull: true,
      },
      cancelledAt: {
        type: DataTypes.DATE,
        field: "cancelled_at",
        allowNull: true,
      },
    },
    {
      tableName: "tickets",
      //timestamps: false,
    }
  );

  Tickets.associate = (models) => {
    Tickets.belongsTo(models.Flights, {
      foreignKey: "flightId",
      targetKey: "id",
      //as: "flight", // alias 설정
    });

    Tickets.belongsTo(models.Seats, {
      foreignKey: "seatId",
      targetKey: "id",
    });

    Tickets.belongsTo(models.Users, {
      foreignKey: "userId",
      targetKey: "id",
    });

    Tickets.hasOne(models.Payments, {
      foreignKey: "ticketId",
      sourceKey: "id",
    });
  };
  return Tickets;
};

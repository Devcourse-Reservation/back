module.exports = (sequelize, DataTypes) => {
  const Tickets = sequelize.define(
    "Tickets",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
        allowNull: false,
      },
      flightId: {
        type: DataTypes.INTEGER,
        field: "flight_id",
        allowNull: false,
      },
      seatId: {
        type: DataTypes.INTEGER,
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
        allowNull: true,
      },
      ticketType: {
        type: DataTypes.STRING,
        field: "ticket_type",
        allowNull: false,
      },
      cancelledAt: {
        type: DataTypes.DATE,
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
  return Tickets;
};

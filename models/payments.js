module.exports = (sequelize, DataTypes) => {
  const Payments = sequelize.define(
    "Payments",
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
      ticketId: {
        type: DataTypes.BIGINT,
        field: "ticket_id",
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.STRING,
        field: "payment_method",
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paidAt: {
        type: DataTypes.DATE,
        field: "paid_at",
      },
      refundedAt: {
        type: DataTypes.DATE,
        field: "refunded_at",
      },
    },
    {
      tableName: "payments",
    }
  );
  Payments.associate = (models) => {
    Payments.belongsTo(models.Tickets, {
      foreignKey: "ticketId",
    });
    Payments.belongsTo(models.Users, {
      foreignKey: "userId",
    });
  };

  return Payments;
};

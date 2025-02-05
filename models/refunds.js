module.exports = (sequelize, DataTypes) => {
  const Refunds = sequelize.define(
    "Refund",
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      paymentId: {
        type: DataTypes.BIGINT,
        field: "payment_id",
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refundStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "refunds",
    }
  );
  Refunds.associate = (models) => {
    Refunds.belongsTo(models.Payments, {
      foreignKey: "paymentId",
    });
  };
  return Refunds;
};

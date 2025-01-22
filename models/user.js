module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "Users",
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "User",
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user", // 기본값 설정 (ex: user, admin)
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
      tableName: "users",
      timestamps: false,
    },
  );
  return Users;
};

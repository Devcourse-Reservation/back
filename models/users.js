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
      phoneNumber: {
        type: DataTypes.STRING,
        field: "phone_number",
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userType: {
        type: DataTypes.STRING,
        field: "user_type",
        allowNull: false,
        defaultValue: "user", // 기본값 설정 (ex: user, admin)
      },
    },
    {
      tableName: "users",
      //timestamps: false,
    }
  );
  Users.associate = (models) => {
    Users.hasMany(models.Payments, {
      foreignKey: "userId",
      sourceKey: "id",
    });
  };
  return Users;
};

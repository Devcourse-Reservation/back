module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "Users",
    {
      id: {
        type: DataTypes.INTEGER,
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

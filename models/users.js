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
        type: DataTypes.ENUM("admin", "user"),
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
    Users.hasMany(models.Queue, {
      foreignKey: "userId",  // Queue 모델에서 참조할 외래 키
      sourceKey: "id",       // Users 모델의 primary key를 참조
    });
    
    Users.hasMany(models.Payments, {
      foreignKey: "userId",
      sourceKey: "id",
    });
    Users.hasMany(models.Tickets, {
      foreignKey: "userId", 
      sourceKey: "id",
    });
  };
  return Users;
};
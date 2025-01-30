module.exports = (sequelize, DataTypes) => {
  const Queue = sequelize.define(
    "Queue",{
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
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending', // 상태 (대기중, 예약 완료 등)
      },
      queuePosition: {
        type: DataTypes.INTEGER,
        field: "queue_position",
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE, 
        allowNull: true, 
      },
    },
    {
      tableName: "queue", 
      //timestamps: false, 
    }
  );

  Queue.associate = (models) => {
    Queue.belongsTo(models.Users, {
      foreignKey: 'userId',
      //targetKey: 'id',     
    });
  };
  return Queue;
};
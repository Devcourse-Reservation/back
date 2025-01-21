module.exports = {
  up: async (queryInterface, Sequelize) => {
    // flights 테이블에서 외래 키 제약 조건 제거
    await queryInterface.removeConstraint('flights', 'flights_ibfk_1'); // 출발 공항 FK
    await queryInterface.removeConstraint('flights', 'flights_ibfk_2'); // 도착 공항 FK

    // airports 테이블에서 airportId를 BIGINT로 변경
    await queryInterface.changeColumn('airports', 'airportId', {
      type: Sequelize.BIGINT,
      allowNull: false,
      autoIncrement: true,
    });

    // flights 테이블에서 id를 BIGINT로 변경
    await queryInterface.changeColumn('flights', 'id', {
      type: Sequelize.BIGINT,
      allowNull: false,
      autoIncrement: true,
    });

    // flights 테이블에서 외래 키 컬럼을 BIGINT로 변경
    await queryInterface.changeColumn('flights', 'departure_airport_id', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
    await queryInterface.changeColumn('flights', 'arrival_airport_id', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });

    // 외래 키 제약 조건 복원
    await queryInterface.addConstraint('flights', {
      fields: ['departure_airport_id'],
      type: 'foreign key',
      name: 'flights_ibfk_1', // 제약 조건 이름
      references: {
        table: 'airports',
        field: 'airportId',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('flights', {
      fields: ['arrival_airport_id'],
      type: 'foreign key',
      name: 'flights_ibfk_2', // 제약 조건 이름
      references: {
        table: 'airports',
        field: 'airportId',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 외래 키 제약 조건 제거
    await queryInterface.removeConstraint('flights', 'flights_ibfk_1');
    await queryInterface.removeConstraint('flights', 'flights_ibfk_2');

    // 복구 시 기존 INTEGER로 되돌림
    await queryInterface.changeColumn('airports', 'airportId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
    });

    await queryInterface.changeColumn('flights', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
    });
    await queryInterface.changeColumn('flights', 'departure_airport_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('flights', 'arrival_airport_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // 외래 키 제약 조건 복원
    await queryInterface.addConstraint('flights', {
      fields: ['departure_airport_id'],
      type: 'foreign key',
      name: 'flights_ibfk_1',
      references: {
        table: 'airports',
        field: 'airportId',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('flights', {
      fields: ['arrival_airport_id'],
      type: 'foreign key',
      name: 'flights_ibfk_2',
      references: {
        table: 'airports',
        field: 'airportId',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
};
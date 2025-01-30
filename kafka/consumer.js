const { Kafka } = require('kafkajs');
const { Queue } = require('../models');
const WebSocket = require('../websocket/websocket');
const { Op } = require('sequelize');

const kafka = new Kafka({
  clientId: 'reservation-consumer',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'reservation-group' });

const consumeQueue = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'reservation_queue', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const queueData = JSON.parse(message.value.toString());
      console.log(`Received message:`, queueData);

      try {
        // 대기열에서 가장 큰 queuePosition 찾기
        const lastQueue = await Queue.findOne({
          order: [['queuePosition', 'DESC']],
          limit: 1
        });

        const newQueuePosition = lastQueue ? lastQueue.queuePosition + 1 : 1;

        // 만료 시간 (5초 뒤)
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + 5);

        // DB에 대기열 추가
        const newQueue = await Queue.create({
          userId: queueData.userId,
          queuePosition: newQueuePosition,
          status: 'pending',
          expiresAt: expiresAt,
        });

        console.log('Message processed and saved to DB:', newQueue);

        // 즉시 WebSocket 브로드캐스트 (대기열 상태 반영)
        WebSocket.broadcast({
          event: 'queueUpdate',
          data: [{ 
            userId: newQueue.userId, 
            queuePosition: newQueue.queuePosition,
            status: newQueue.status
          }]
        });

        console.log('Sent queue update to clients:', { 
          userId: newQueue.userId, 
          queuePosition: newQueue.queuePosition 
        });

        // 대기열 업데이트 실행 (순서 변경 시 적용)
        await updateQueuePositions();

      } catch (error) {
        console.error('❌ Error processing message:', error);
      }
    }
  });

  setInterval(async () => {
    await handleExpiredQueueItems();
  }, 5000);
};

const handleExpiredQueueItems = async () => {
  try {
    const expiredQueueItems = await Queue.findAll({
      where: { expiresAt: { [Op.lte]: new Date() }, status: 'pending' },
    });

    if (expiredQueueItems.length > 0) {
      const expiredQueueData = expiredQueueItems.map(item => ({
        id: item.id,
        userId: item.userId,
        queuePosition: item.queuePosition,
      }));

      await Queue.destroy({ where: { expiresAt: { [Op.lte]: new Date() } } });

      console.log('Expired queue items deleted:', expiredQueueData);

      WebSocket.broadcast({
        event: 'queueExpired',
        data: expiredQueueData
      });

      await updateQueuePositions();
    }
  } catch (error) {
    console.error('❌ Error handling expired queue items:', error);
  }
};

// 대기열에서 처리된 항목을 업데이트 (순서 변경 반영)
const updateQueuePositions = async () => {
  try {
    const pendingQueueItems = await Queue.findAll({
      where: { status: 'pending' },
      order: [['queuePosition', 'ASC']],
    });

    const updatedItems = [];

    for (let i = 0; i < pendingQueueItems.length; i++) {
      const item = pendingQueueItems[i];
      const updatedPosition = i + 1;

      if (item.queuePosition !== updatedPosition) {
        await item.update({ queuePosition: updatedPosition });
        updatedItems.push({ userId: item.userId, queuePosition: updatedPosition });
        console.log(`Updated queuePosition of user ${item.userId} to ${updatedPosition}`);
      }
    }

    // WebSocket을 통해 변경된 항목 즉시 전송
    if (updatedItems.length > 0) {
      WebSocket.broadcast({
        event: 'queuePositionsUpdated',
        data: { updatedQueue: updatedItems },
      });

      console.log('Sent queue position updates to clients:', updatedItems);
    }
  } catch (error) {
    console.error('❌ Error updating queue positions:', error);
  }
};

module.exports = consumeQueue;

const { Kafka } = require('kafkajs');
const { Queue } = require('../models');
const WebSocket = require('../websocket/websocket');
const { updateQueuePositions } = require('../utils/queueUtils');

const kafka = new Kafka({
  clientId: 'reservation-consumer',
  brokers: [process.env.KAFKA_BROKER]
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
};

module.exports = consumeQueue;

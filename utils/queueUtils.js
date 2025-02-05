const { Queue } = require('../models');
const { Op } = require('sequelize');
const WebSocket = require('../websocket/websocket');

const handleExpiredQueueItems = async () => {
  try {
    const expiredQueueItems = await Queue.findAll({
      where: { expiresAt: { [Op.lte]: new Date() }, status: 'pending' }, // expireAt이 현재시간보다 작은 항목 찾기
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
        console.log(`***Updated queuePosition of user ${item.userId} to ${updatedPosition}`);
      }
    }

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

module.exports = { handleExpiredQueueItems, updateQueuePositions };

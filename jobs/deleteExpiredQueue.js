const { Queue } = require('../models');
const cron = require('node-cron');
const { Op } = require('sequelize');

const deleteExpiredQueue = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expiredItems = await Queue.findAll({
        where: {
          [Op.and]: [
            { expiresAt: { [Op.lt]: new Date() } },
            { status: 'pending' } 
          ]
        },
        order: [['queuePosition', 'ASC']]
      });

      if (expiredItems.length > 0) {
        const expiredItemIds = expiredItems.map(item => item.id);

        await Queue.update({ status: 'expired' }, { where: { id: expiredItemIds } });

        console.log(`Marked ${expiredItems.length} queue items as expired`);

        setTimeout(async () => {
          await Queue.destroy({ where: { id: expiredItemIds } });
          console.log(`Deleted expired queue items: ${expiredItemIds.join(', ')}`);

          await updateQueuePositions();
        }, 60 * 60 * 1000); 
      }
    } catch (error) {
      console.error('Error deleting expired queues:', error);
    }
  });
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
        updatedItems.push(item); 
        console.log(`Updated queuePosition of item ${item.id} to ${updatedPosition}`);
      }
    }

    if (updatedItems.length > 0) {
      WebSocket.broadcast({
        event: 'queuePositionsUpdated',
        data: {
          updatedQueue: updatedItems || [], 
        },
      });
    }

  } catch (error) {
    console.error('Error updating queue positions:', error);
  }
};

module.exports = deleteExpiredQueue;
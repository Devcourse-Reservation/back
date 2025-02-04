const cron = require('node-cron');
const { handleExpiredQueueItems } = require('../utils/queueUtils');

const deleteExpiredQueue = () => {
  cron.schedule('*/5 * * * *', async () => { // 5분마다 실행
    await handleExpiredQueueItems();
  });
};
module.exports = deleteExpiredQueue;
const WebSocket = require('ws');
const { Queue, Users } = require('../models');
const { Op } = require('sequelize');

let clients = [];

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws) => {
    console.log('Client connected');
    clients.push(ws);

    try {
      const user = await Users.findOne({ order: [['id', 'ASC']] });
      if (!user) {
        ws.send(JSON.stringify({ event: 'error', message: 'No user found in the database' }));
        return;
      }

      ws.userId = user.id;
      console.log(`사용자 ID 할당됨: ${ws.userId}`);

      // 클라이언트에게 userId 전송
      ws.send(JSON.stringify({ event: 'userIdAssigned', userId: ws.userId }));

      // 대기열 상태 즉시 전송
      sendQueueStatusToClient(ws);
    } catch (error) {
      console.error('❌ Error assigning userId:', error);
      ws.send(JSON.stringify({ event: 'error', message: 'Failed to assign userId' }));
    }

    ws.on('message', async (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        console.log('Received:', parsedMessage);

        if (parsedMessage.event === 'getQueueStatus') {
          console.log('Sending queue status to client...');
          sendQueueStatusToClient(ws);
        } else {
          console.warn(`Unknown message received:`, parsedMessage);
        }
      } catch (error) {
        console.error('❌ Error handling message:', error);
      }
    });

    ws.on('close', () => {
      console.log(`🔹 Client disconnected (userId: ${ws.userId})`);
      clients = clients.filter(client => client !== ws);
    });
  });

  // 클라이언트에게 대기열 상태 전송
  const sendQueueStatusToClient = async (ws) => {
    try {
      const queueItems = await Queue.findAll({ order: [['queuePosition', 'ASC']] });

      const queueStatus = queueItems.map(item => ({
        id: item.id,
        userId: item.userId,
        queuePosition: item.queuePosition,
        status: item.status,
      }));

      // 사용자 대기열 순서 찾기
      const userQueueItem = queueItems.find(item => item.userId === ws.userId);
      const myPosition = userQueueItem ? userQueueItem.queuePosition : null;
      const usersBehind = myPosition ? queueItems.length - myPosition : 0;

      const queueData = {
        event: 'queueUpdate',
        data: queueStatus,
        myPosition,
        usersBehind
      };

      ws.send(JSON.stringify(queueData));
      console.log('Sent queue status to client:', queueData);

    } catch (error) {
      console.error('❌ Error sending queue status:', error);
      ws.send(JSON.stringify({ event: 'error', message: 'Failed to fetch queue status.' }));
    }
  };
};

// **강제 WebSocket 브로드캐스트 (모든 클라이언트에게 변경 사항 전송)**
const broadcast = (data) => {
  console.log('📢 Broadcasting data to all clients:', data);
  clients = clients.filter(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
      return true;
    }
    return false;
  });
};

module.exports.broadcast = broadcast;

// **만료된 대기열 항목을 클라이언트에게 전송 후 삭제하는 함수**
const sendExpiredQueueItems = async () => {
  try {
    const expiredItems = await Queue.findAll({
      where: { expiresAt: { [Op.lt]: new Date() } },
      order: [['queuePosition', 'ASC']],
    });

    if (expiredItems.length > 0) {
      const expiredQueueData = expiredItems.map(item => ({
        id: item.id,
        userId: item.userId,
        queuePosition: item.queuePosition,
      }));

      // 만료된 항목 클라이언트에게 전송
      broadcast({ event: 'queueExpired', data: expiredQueueData });

      // 만료된 항목 삭제
      await Queue.destroy({ where: { expiresAt: { [Op.lt]: new Date() } } });
      console.log('Expired queue items sent and deleted.');
    }
  } catch (error) {
    console.error('❌ Error sending expired queue items:', error);
  }
};

setInterval(sendExpiredQueueItems, 5000);
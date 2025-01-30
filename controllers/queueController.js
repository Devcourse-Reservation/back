const sendToQueue = require('../kafka/producer');
const db = require('../models');
const { sequelize } = require('../models');
const { broadcast } = require('../websocket/websocket'); // 🔹 WebSocket broadcast 함수 가져오기

const Queue = db.Queue;

const addToQueue = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: '로그인을 하십시오' });
  }

  try {
    const queueData = { userId };
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await sendToQueue(queueData);

    const newQueueItem = await sequelize.transaction(async (t) => {
      const maxPosition = await Queue.max('queuePosition', { transaction: t }) || 0;
      return await Queue.create({
        userId,
        queuePosition: maxPosition + 1,
        status: 'pending',
        expiresAt,
      }, { transaction: t });
    });

    broadcast({
      event: 'queueUpdated',
      data: { userId, queuePosition: newQueueItem.queuePosition },
    });

    res.status(200).json({
      success: true,
      message: '대기열 요청이 성공적으로 추가되었습니다.',
      data: newQueueItem,
    });
  } catch (error) {
    console.error('Error adding to queue:', error);
    res.status(500).json({ success: false, message: '대기열 추가 중 오류 발생', details: error.message });
  }
};

const getUserQueuePosition = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId가 필요합니다.' });
  }

  try {
    const userQueueItem = await Queue.findOne({
      where: { userId, status: 'pending' },
      order: [['queuePosition', 'ASC']],
    });

    if (!userQueueItem) {
      return res.status(404).json({ success: false, message: '현재 대기열에 없습니다.' });
    }

    const totalUsers = await Queue.count({ where: { status: 'pending' } });
    const usersBehind = totalUsers - userQueueItem.queuePosition;

    res.status(200).json({
      success: true,
      message: '사용자의 대기열 순서 조회 성공',
      data: {
        userId: userQueueItem.userId,
        queuePosition: userQueueItem.queuePosition,
        usersBehind,
      }
    });
  } catch (error) {
    console.error('Error getting queue position:', error);
    res.status(500).json({ success: false, message: '대기열 순서 조회 중 오류 발생', details: error.message });
  }
};

module.exports = { addToQueue, getUserQueuePosition };

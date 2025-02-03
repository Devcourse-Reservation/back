const express = require('express');
const { verifyToken } = require('../middlewares/jwtMiddleware');
const { addToQueue, getUserQueuePosition } = require('../controllers/queueController');

const router = express.Router();

router.post('/add', verifyToken, addToQueue);
router.get('/position/:userId', verifyToken, getUserQueuePosition);  // 사용자의 대기열 순서 조회 API

module.exports = router;

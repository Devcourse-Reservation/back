const express = require('express');
const { addToQueue, getUserQueuePosition } = require('../controllers/queueController');

const router = express.Router();

router.post('/add', addToQueue);
router.get('/position/:userId', getUserQueuePosition);  // 사용자의 대기열 순서 조회 API

module.exports = router;

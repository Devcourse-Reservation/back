const express = require('express');
const { verifyToken } = require('../middlewares/jwtMiddleware');
const { addAirport, updateAirport, deleteAirport } = require('../controllers/airportController');

const router = express.Router();
//router.use(express.json());
router.use(verifyToken);

router.post('/', verifyToken, addAirport); // 공항 추가
router.put('/:airportId', verifyToken, updateAirport); // 공항 수정
router.delete('/:airportId', verifyToken, deleteAirport); // 공항 삭제

module.exports = router;
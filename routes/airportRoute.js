const express = require('express');
const { verifyToken } = require('../middlewares/jwtMiddleware');
const { verifyAdmin} = require('../middlewares/adminMiddleware');
const { addAirport, updateAirport, deleteAirport, getAirports } = require('../controllers/airportController');

const router = express.Router();
//router.use(express.json());

router.get('/', getAirports);
router.post('/', verifyToken, verifyAdmin, addAirport); // 공항 추가
router.put('/:airportId', verifyToken, verifyAdmin, updateAirport); // 공항 수정
router.delete('/:airportId', verifyToken, verifyAdmin, deleteAirport); // 공항 삭제

module.exports = router;
const express = require('express');
const router = express.Router();
router.use(express.json());

const {
    searchFlights,
    //flightDetail,
} = require('../controllers/flightController');

router.post('/search', searchFlights);
//router.get('/:id', flightDetail);

module.exports = router;
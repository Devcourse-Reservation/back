const { Airports } = require('../models'); 

const addAirport = async (req, res) => {
    try {    
        const { name, code, city, country } = req.body;
        if (!name || !code || !city || !country) {
            return res.status(400).json({ error : '모든 필드(name, code, city, country)가 필요합니다.' });
        }
        const newAirport = await Airports.create({ name, code, city, country });
        res.status(201).json(newAirport);
    } catch (error) {
        console.error('Error adding airport: ', error.message);
        res.status(500).json({ error: '공항 추가 중 문제가 발생했습니다.'});
    }
};
const updateAirport = async (req, res) => {
    try {
        const { airportId } = req.params;
        const { name, code, city, country } = req.body;

        const airport = await Airports.findByPk(airportId);
        if (!airport) {
            return res.status(404).json({ error: '해당 공항을 찾을 수 없습니다.' });
        }
        await airport.update({ name, code, city, country });
        res.json({ message: '공항 정보가 성공적으로 업데이트되었습니다.', airport });
    } catch (error) {
        console.error('Error updating airport:', error.message);
        res.status(500).json({ error: '공항 수정 중 문제가 발생했습니다.' });
    }
};
const deleteAirport = async (req, res) => {
    try {
        const { airportId } = req.params;
        const airport = await Airports.findByPk(airportId);

        if (!airport) {
            return res.status(404).json({ error: '해당 공항을 찾을 수 없습니다.' });
        }

        await airport.destroy();
        res.json({ message: '공항이 성공적으로 삭제되었습니다.'});
    } catch (error) {
        console.error('Error deleting airport:', error.message);
        res.status(500).json({ error: '공항 삭제 중 문제가 발생했습니다.' });
    }
};

const getAirports = async (req, res) => {
    try {
        const airports = await Airports.findAll(); // ✅ 모든 공항 정보 조회
        res.json(airports); // ✅ 조회된 데이터를 JSON 응답으로 반환
    } catch (error) {
        console.error('Error fetching airports:', error.message);
        res.status(500).json({ error: '공항 정보를 가져오는 중 문제가 발생했습니다.' });
    }
};


module.exports = {
    addAirport,
    updateAirport,
    deleteAirport,
    getAirports
};
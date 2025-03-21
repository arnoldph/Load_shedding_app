const axios = require('axios');

const getSchedule = async (req, res) => {
    const { suburb_id, province_id, municipality_total } = req.query;

    if (!suburb_id || !province_id || !municipality_total) {
        return res.status(400).json({ msg: 'Missing required query parameters' });
    }

    try {
        const stageResponse = await axios.get('https://loadshedding.eskom.co.za/LoadShedding/GetStatus');
        let stageNumber = parseInt(stageResponse.data, 10);

        if (stageNumber < 1) {
            stageNumber = 0;
        } else {
            stageNumber -= 1;
        }

        const apiUrl = `https://loadshedding.eskom.co.za/LoadShedding/GetScheduleM/${suburb_id}/${stageNumber + 1}/${province_id}/${municipality_total}`;
        const response = await axios.get(apiUrl);

        res.json({ stage: stageNumber, schedule: response.data });
    } catch (error) {
        console.error('Error fetching data from Eskom API:', error);
        res.status(500).json({ msg: 'Error fetching data from Eskom API' });
    }
};

module.exports = {
    getSchedule,
};
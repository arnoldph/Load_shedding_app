require('dotenv').config();
const express = require('express');
const axios = require('axios'); 
const path = require('path');
const port = process.env.PORT || 8000;

const app = express();

// Setup static folder
app.use(express.static(path.join(__dirname, 'public')));

// Fetch Eskom Load Shedding Schedule
app.get('/api/LoadShedding', async (req, res) => {
    const { suburb_id, province_id, municipality_total } = req.query;

    if (!suburb_id || !province_id || !municipality_total) {
        return res.status(400).json({ msg: 'Missing required query parameters' });
    }

    try {
        // Fetch the current stage
        const stageResponse = await axios.get('https://loadshedding.eskom.co.za/LoadShedding/GetStatus');
        let stageNumber = parseInt(stageResponse.data, 10);

        if (stageNumber < 1) {
            stageNumber = 0; // No load shedding
        } else {
            stageNumber -= 1; // Adjust stage number
        }

        const apiUrl = `https://loadshedding.eskom.co.za/LoadShedding/GetScheduleM/${suburb_id}/${stageNumber + 1}/${province_id}/${municipality_total}`;
        const response = await axios.get(apiUrl);

        // Send the schedule data as the response
        res.json({ stage: stageNumber, schedule: response.data });
    } catch (error) {
        console.error('Error fetching data from Eskom API:', error);
        res.status(500).json({ msg: 'Error fetching data from Eskom API' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
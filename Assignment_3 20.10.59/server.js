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
    const { suburb_id, stage, province_id, municipality_total } = req.query;

    if (!suburb_id || !stage || !province_id || !municipality_total) {
        return res.status(400).json({ msg: 'Missing required query parameters' });
    }

    const apiUrl = `https://loadshedding.eskom.co.za/LoadShedding/GetScheduleM/${suburb_id}/${stage}/${province_id}/${municipality_total}`;
    
    try {
        const response = await axios.get(apiUrl);
        const htmlContent = response.data;

        // Send the raw HTML content as the response
        res.send(htmlContent);
    } catch (error) {
        console.error('Error fetching data from Eskom API:', error);
        res.status(500).json({ msg: 'Error fetching data from Eskom API' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
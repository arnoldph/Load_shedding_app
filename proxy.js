const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/proxy', (req, res) => {
    const url = req.query.url;
    request(
        { url, headers: { 'Access-Control-Allow-Origin': '*' } },
        (error, response, body) => {
            if (error) {
                return res.status(500).send(error);
            }
            res.set('Access-Control-Allow-Origin', '*');
            res.send(body);
        }
    );
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
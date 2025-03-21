const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Allowed domains (for security)
const ALLOWED_DOMAINS = [
    'loadshedding.eskom.co.za',
    // Add other allowed domains here
];

// Validate URL
const isValidUrl = (url) => {
    try {
        const parsedUrl = new URL(url);
        return ALLOWED_DOMAINS.includes(parsedUrl.hostname);
    } catch (error) {
        return false;
    }
};

// Proxy endpoint
app.get('/proxy', (req, res) => {
    const url = req.query.url;

    // Validate the URL
    if (!url || !isValidUrl(url)) {
        return res.status(400).json({ error: 'Invalid or unauthorized URL' });
    }

    // Forward the request
    request(
        { url, headers: { 'Access-Control-Allow-Origin': '*' } },
        (error, response, body) => {
            if (error) {
                console.error('Proxy error:', error); // Log the error
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Set CORS headers and send the response
            res.set('Access-Control-Allow-Origin', '*');
            res.send(body);
        }
    );
});

// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
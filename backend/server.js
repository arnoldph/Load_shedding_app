require('dotenv').config();
const express = require('express');
const path = require('path');
const loadSheddingRoutes = require('./routes/loadSheddingRoutes');

const app = express();
const port = process.env.PORT || 8000;

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../public')));

// Use the load-shedding routes
app.use('/api', loadSheddingRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
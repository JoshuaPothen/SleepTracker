// Simple Node.js API server to receive data from ESP32C6
// This can run locally or be deployed to a service like Vercel/Netlify

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve index.html

// Store latest sensor data
let latestData = {
    heartRate: 0,
    breathRate: 0,
    distance: 0,
    timestamp: null
};

// Endpoint to receive data from ESP32C6
app.post('/api/sleep-data', (req, res) => {
    const { heart_rate, breath_rate, distance } = req.body;
    
    latestData = {
        heartRate: heart_rate || 0,
        breathRate: breath_rate || 0,
        distance: distance || 0,
        timestamp: new Date().toISOString()
    };
    
    console.log('Received data:', latestData);
    res.json({ success: true, message: 'Data received' });
});

// Endpoint to get latest data (for website)
app.get('/api/sleep-data', (req, res) => {
    res.json(latestData);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the sleep tracker`);
});

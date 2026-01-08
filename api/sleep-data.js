// Vercel Serverless Function for Sleep Data
// This handles both GET and POST requests

// In-memory storage (Note: This resets when the function cold-starts)
// For persistent storage, consider using Vercel KV or a database
let latestData = {
    heartRate: 0,
    breathRate: 0,
    distance: 0,
    timestamp: null
};

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Handle POST - Receive data from ESP32
    if (req.method === 'POST') {
        const { heart_rate, breath_rate, distance } = req.body;
        
        latestData = {
            heartRate: heart_rate || 0,
            breathRate: breath_rate || 0,
            distance: distance || 0,
            timestamp: new Date().toISOString()
        };
        
        console.log('Received data:', latestData);
        
        res.status(200).json({ 
            success: true, 
            message: 'Data received',
            data: latestData 
        });
        return;
    }

    // Handle GET - Send data to website
    if (req.method === 'GET') {
        res.status(200).json(latestData);
        return;
    }

    // Handle unsupported methods
    res.status(405).json({ error: 'Method not allowed' });
}

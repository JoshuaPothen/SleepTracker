// Vercel Serverless Function for Buzz Signal
// Receives buzz requests from website and stores them for ESP32 to poll

let buzzSignal = {
    active: false,
    timestamp: null,
    count: 0
};

module.exports = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Handle POST - Receive buzz request from website
    if (req.method === 'POST') {
        buzzSignal = {
            active: true,
            timestamp: new Date().toISOString(),
            count: buzzSignal.count + 1
        };
        
        console.log('Buzz signal activated:', buzzSignal);
        
        res.status(200).json({ 
            success: true, 
            message: 'Buzz signal sent',
            count: buzzSignal.count
        });
        return;
    }

    // Handle GET - ESP32 checks for buzz signal
    if (req.method === 'GET') {
        const response = {
            active: buzzSignal.active,
            timestamp: buzzSignal.timestamp,
            count: buzzSignal.count
        };
        
        // Reset the signal after ESP32 retrieves it
        if (buzzSignal.active) {
            buzzSignal.active = false;
        }
        
        res.status(200).json(response);
        return;
    }

    // Handle unsupported methods
    res.status(405).json({ error: 'Method not allowed' });
};

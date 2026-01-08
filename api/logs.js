// Vercel Serverless Function for Event Logging
// Logs buzz events and state changes with timestamps

let eventLog = [];

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

    // Handle POST - Log new event
    if (req.method === 'POST') {
        const { type, data, timestamp } = req.body;
        
        const event = {
            id: Date.now(),
            type: type, // 'buzz' or 'state_change'
            data: data,
            timestamp: timestamp || new Date().toISOString()
        };
        
        // Add to log (keep last 1000 events in memory)
        eventLog.push(event);
        if (eventLog.length > 1000) {
            eventLog = eventLog.slice(-1000);
        }
        
        console.log('Event logged:', event);
        
        res.status(200).json({ 
            success: true, 
            message: 'Event logged',
            event: event
        });
        return;
    }

    // Handle GET - Retrieve event logs
    if (req.method === 'GET') {
        const { limit, type, since } = req.query;
        
        let filteredLogs = [...eventLog];
        
        // Filter by type if specified
        if (type) {
            filteredLogs = filteredLogs.filter(e => e.type === type);
        }
        
        // Filter by timestamp if specified
        if (since) {
            const sinceDate = new Date(since);
            filteredLogs = filteredLogs.filter(e => new Date(e.timestamp) > sinceDate);
        }
        
        // Limit results
        const resultLimit = parseInt(limit) || 100;
        filteredLogs = filteredLogs.slice(-resultLimit);
        
        res.status(200).json({
            total: filteredLogs.length,
            events: filteredLogs
        });
        return;
    }

    // Handle unsupported methods
    res.status(405).json({ error: 'Method not allowed' });
};

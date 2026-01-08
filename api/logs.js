// Vercel Serverless Function for Event Logging with Vercel KV
// Logs buzz events and state changes with timestamps
// Uses Vercel KV (Redis) for persistent long-term storage

const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Handle POST - Log new event
    if (req.method === 'POST') {
        try {
            const { type, data, timestamp } = req.body;
            
            const event = {
                id: Date.now(),
                type: type, // 'buzz' or 'state_change'
                data: data,
                timestamp: timestamp || new Date().toISOString()
            };
            
            // Store event in KV with unique key
            const eventKey = `event:${event.id}`;
            await kv.set(eventKey, JSON.stringify(event));
            
            // Add to sorted set for time-based queries
            await kv.zadd('events:timeline', {
                score: event.id,
                member: eventKey
            });
            
            // Optional: Keep only last 10,000 events to manage storage
            const totalEvents = await kv.zcard('events:timeline');
            if (totalEvents > 10000) {
                // Remove oldest events
                const toRemove = await kv.zrange('events:timeline', 0, totalEvents - 10000);
                for (const key of toRemove) {
                    await kv.del(key);
                }
                await kv.zremrangebyrank('events:timeline', 0, totalEvents - 10000);
            }
            
            console.log('Event logged to KV:', event);
            
            res.status(200).json({ 
                success: true, 
                message: 'Event logged to database',
                event: event
            });
            return;
        } catch (error) {
            console.error('Error logging event:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to log event',
                error: error.message
            });
            return;
        }
    }

    // Handle GET - Retrieve event logs
    if (req.method === 'GET') {
        try {
            const { limit, type, since, days } = req.query;
            const resultLimit = parseInt(limit) || 100;
            
            // Get event keys from sorted set (most recent first)
            let eventKeys;
            
            if (days) {
                // Get events from last N days
                const daysAgo = new Date();
                daysAgo.setDate(daysAgo.getDate() - parseInt(days));
                const sinceTimestamp = daysAgo.getTime();
                eventKeys = await kv.zrangebyscore('events:timeline', sinceTimestamp, '+inf');
            } else if (since) {
                // Get events since a specific timestamp
                const sinceTimestamp = new Date(since).getTime();
                eventKeys = await kv.zrangebyscore('events:timeline', sinceTimestamp, '+inf');
            } else {
                // Get last N events
                eventKeys = await kv.zrange('events:timeline', -resultLimit, -1);
            }
            
            // Retrieve event data
            const events = [];
            for (const key of eventKeys) {
                const eventData = await kv.get(key);
                if (eventData) {
                    const event = typeof eventData === 'string' ? JSON.parse(eventData) : eventData;
                    events.push(event);
                }
            }
            
            // Filter by type if specified
            let filteredLogs = events;
            if (type) {
                filteredLogs = events.filter(e => e.type === type);
            }
            
            // Sort by timestamp (newest first)
            filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Apply limit
            filteredLogs = filteredLogs.slice(0, resultLimit);
            
            res.status(200).json({
                total: filteredLogs.length,
                totalStored: await kv.zcard('events:timeline'),
                events: filteredLogs
            });
            return;
        } catch (error) {
            console.error('Error retrieving events:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve events',
                error: error.message,
                events: []
            });
            return;
        }
    }

    // Handle DELETE - Clear old logs (optional maintenance endpoint)
    if (req.method === 'DELETE') {
        try {
            const { beforeDays, confirmToken } = req.query;
            
            // Simple security: require a token to delete
            if (confirmToken !== 'DELETE_OLD_LOGS') {
                res.status(403).json({
                    success: false,
                    message: 'Invalid confirmation token'
                });
                return;
            }
            
            if (beforeDays) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - parseInt(beforeDays));
                const cutoffTimestamp = cutoffDate.getTime();
                
                // Get events older than cutoff
                const oldEventKeys = await kv.zrangebyscore('events:timeline', 0, cutoffTimestamp);
                
                // Delete old events
                for (const key of oldEventKeys) {
                    await kv.del(key);
                }
                
                // Remove from timeline
                await kv.zremrangebyscore('events:timeline', 0, cutoffTimestamp);
                
                res.status(200).json({
                    success: true,
                    message: `Deleted ${oldEventKeys.length} events older than ${beforeDays} days`,
                    deleted: oldEventKeys.length
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Please specify beforeDays parameter'
                });
            }
            return;
        } catch (error) {
            console.error('Error deleting events:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete events',
                error: error.message
            });
            return;
        }
    }

    // Handle unsupported methods
    res.status(405).json({ error: 'Method not allowed' });
};

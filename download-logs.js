// Node.js script to download and save logs to a file
// Run this periodically to backup logs from Vercel to a persistent file

const fs = require('fs');
const https = require('https');

const API_URL = 'https://sleep-tracker-pi-ten.vercel.app/api/logs?limit=1000';
const LOG_FILE = './sleep-tracker-logs.json';

function downloadLogs() {
    https.get(API_URL, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const logs = JSON.parse(data);
                
                // Load existing logs if file exists
                let existingLogs = { events: [] };
                if (fs.existsSync(LOG_FILE)) {
                    const fileContent = fs.readFileSync(LOG_FILE, 'utf8');
                    existingLogs = JSON.parse(fileContent);
                }
                
                // Merge new logs with existing ones (avoid duplicates by ID)
                const existingIds = new Set(existingLogs.events.map(e => e.id));
                const newEvents = logs.events.filter(e => !existingIds.has(e.id));
                
                existingLogs.events.push(...newEvents);
                
                // Sort by timestamp
                existingLogs.events.sort((a, b) => 
                    new Date(a.timestamp) - new Date(b.timestamp)
                );
                
                // Save to file
                fs.writeFileSync(LOG_FILE, JSON.stringify(existingLogs, null, 2));
                
                console.log(`✅ Logs saved: ${existingLogs.events.length} total events`);
                console.log(`📊 New events added: ${newEvents.length}`);
                
                // Print summary
                const buzzCount = existingLogs.events.filter(e => e.type === 'buzz').length;
                const stateChanges = existingLogs.events.filter(e => e.type === 'state_change').length;
                console.log(`   - Buzz events: ${buzzCount}`);
                console.log(`   - State changes: ${stateChanges}`);
                
            } catch (error) {
                console.error('❌ Error processing logs:', error.message);
            }
        });
    }).on('error', (error) => {
        console.error('❌ Error downloading logs:', error.message);
    });
}

// Run immediately
downloadLogs();

// Optionally run periodically (every 5 minutes)
// setInterval(downloadLogs, 5 * 60 * 1000);

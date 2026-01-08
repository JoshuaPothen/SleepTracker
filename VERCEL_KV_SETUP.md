# Vercel KV Setup Guide for Long-Term Logging

## Overview
Your sleep tracker now uses **Vercel KV** (Redis-based key-value storage) for persistent, long-term event logging. This replaces the previous in-memory solution that lost data after 1 hour.

## Benefits
- ✅ **Persistent Storage**: Data survives serverless function restarts
- ✅ **Long-Term**: Stores up to 10,000 events (configurable)
- ✅ **Fast**: Redis-based for quick reads/writes
- ✅ **Free Tier**: Generous free tier for hobby projects
- ✅ **Automatic Cleanup**: Removes oldest events when limit reached

## Setup Steps

### 1. Create Vercel KV Database

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on "Storage" in the top navigation
3. Click "Create Database"
4. Select "KV" (Key-Value Store)
5. Choose a name: `sleep-tracker-logs`
6. Select your region (closest to you for best performance)
7. Click "Create"

### 2. Connect to Your Project

1. In the KV database page, click "Connect Project"
2. Select your `SleepTracker` project
3. Choose environment: **Production** (and optionally Preview/Development)
4. Click "Connect"

That's it! Vercel automatically adds the required environment variables to your project.

### 3. Deploy Updated Code

```bash
# Install the new dependency
npm install

# Commit and push to deploy
git add .
git commit -m "Add Vercel KV for persistent logging"
git push
```

Vercel will automatically deploy and your logging will now persist!

## Features

### Automatic Storage Management
- Stores last **10,000 events** by default
- Automatically removes oldest events when limit is reached
- Configurable in `api/logs.js` (line 41)

### Query Options

**Get last 100 events:**
```
GET /api/logs
```

**Get last 500 events:**
```
GET /api/logs?limit=500
```

**Get events from last 7 days:**
```
GET /api/logs?days=7
```

**Get only buzz events:**
```
GET /api/logs?type=buzz
```

**Get events since specific date:**
```
GET /api/logs?since=2026-01-01T00:00:00Z
```

### Maintenance Endpoint

**Delete events older than 30 days:**
```
DELETE /api/logs?beforeDays=30&confirmToken=DELETE_OLD_LOGS
```

## Monitoring

### View Total Stored Events
The API response includes `totalStored` field:
```json
{
  "total": 100,
  "totalStored": 5432,
  "events": [...]
}
```

### Vercel Dashboard
- Go to Storage → sleep-tracker-logs
- View usage statistics
- Monitor storage limits

## Free Tier Limits (as of 2026)

- **Storage**: 256 MB
- **Requests**: 30,000 per month
- **Bandwidth**: 100 MB per month

Your current usage (10,000 events × ~500 bytes) ≈ 5 MB, well within limits!

## Cost Optimization

If you need to reduce storage:

1. **Lower event limit** in `api/logs.js`:
```javascript
if (totalEvents > 5000) { // Changed from 10000
```

2. **Automatic cleanup** - Run monthly:
```bash
curl -X DELETE "https://your-app.vercel.app/api/logs?beforeDays=90&confirmToken=DELETE_OLD_LOGS"
```

3. **Log only important events** - Filter in your frontend before sending

## Troubleshooting

### "kv is not defined" error
- Make sure you've connected the KV database to your project in Vercel dashboard
- Redeploy after connecting

### Old data still showing
- KV is persistent, old in-memory data won't appear
- New events will be logged starting now

### High latency
- Choose a KV region closer to your primary location
- Consider upgrading to a paid plan for better performance

## Migration from Old System

The old in-memory system is replaced. Previous logs (from before KV setup) won't be migrated, but all new events will persist long-term.

## Security Note

The DELETE endpoint requires a confirmation token (`DELETE_OLD_LOGS`) to prevent accidental data loss. You can customize this token in `api/logs.js` for additional security.

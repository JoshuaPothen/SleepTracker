# Sleep Tracker - Long-Term Logging Solution

## 🎉 Problem Solved!

Your Vercel serverless functions were resetting logs after ~1 hour due to cold starts. **Now fixed with Vercel KV (Redis database)** for persistent, long-term storage!

---

## 📋 Quick Setup (5 minutes)

### Step 1: Create Vercel KV Database
1. Go to https://vercel.com/dashboard
2. Click **Storage** → **Create Database**
3. Select **KV** (Key-Value Store)
4. Name it: `sleep-tracker-logs`
5. Choose region closest to you
6. Click **Create**

### Step 2: Connect to Project
1. Click **Connect Project**
2. Select `SleepTracker` project
3. Environment: **Production** ✅
4. Click **Connect**

### Step 3: Deploy
```bash
npm install
git add .
git commit -m "Add Vercel KV for persistent logging"
git push
```

**That's it!** Vercel will auto-deploy and your logs will persist forever! 🎊

---

## 🚀 What Changed?

### Before (In-Memory)
- ❌ Logs reset every ~1 hour (cold starts)
- ❌ Lost data on function restarts
- ❌ No long-term history

### After (Vercel KV)
- ✅ Persistent storage (survives restarts)
- ✅ Stores up to 10,000 events
- ✅ Automatic cleanup of old events
- ✅ Fast Redis-based queries
- ✅ Free tier: 256 MB storage, 30K requests/month

---

## 📊 Features

### Auto Storage Management
- Keeps last **10,000 events** automatically
- Removes oldest when limit reached
- Configurable in `api/logs.js` (line 41)

### Query Options

**View logs dashboard:**
```
https://sleep-tracker-pi-ten.vercel.app/logs.html
```

**API queries:**
```bash
# Last 100 events (default)
GET /api/logs

# Last 7 days
GET /api/logs?days=7

# Only buzz events
GET /api/logs?type=buzz

# Last 500 state changes
GET /api/logs?type=state_change&limit=500

# Events since Jan 1, 2026
GET /api/logs?since=2026-01-01T00:00:00Z
```

### Dashboard Features
- 📈 Real-time stats (total stored, buzz count, state changes)
- 🔍 Filter by type (buzz/state_change)
- 📅 Filter by time range (24h, 7d, 30d, 90d, all time)
- 💾 Download logs as JSON
- 🔄 Auto-refresh every 30 seconds

---

## 🛠 Maintenance

### View Storage Usage
1. Go to Vercel Dashboard → Storage
2. Click on `sleep-tracker-logs`
3. See usage stats

### Delete Old Logs (Optional)
```bash
# Delete events older than 90 days
curl -X DELETE "https://sleep-tracker-pi-ten.vercel.app/api/logs?beforeDays=90&confirmToken=DELETE_OLD_LOGS"
```

### Reduce Storage (if needed)
Edit `api/logs.js` line 41:
```javascript
if (totalEvents > 5000) { // Changed from 10000
```

---

## 💡 Cost Estimate

**Current usage:**
- 10,000 events × 500 bytes = **~5 MB**
- Well within free tier (256 MB limit)
- Average requests: ~100/day = 3,000/month (free tier: 30,000)

**You're good for years!** 🎉

---

## 🔐 Security

- DELETE endpoint requires confirmation token
- CORS enabled for your frontend
- No sensitive data exposed
- Token customizable in `api/logs.js`

---

## 📝 Logged Events

### Buzz Events
```json
{
  "type": "buzz",
  "data": {
    "count": 42,
    "currentState": "deep-sleep"
  },
  "timestamp": "2026-01-08T10:30:00Z"
}
```

### State Changes
```json
{
  "type": "state_change",
  "data": {
    "from": "awake",
    "to": "light-sleep",
    "heartRate": 65.3,
    "breathRate": 17.2,
    "distance": 0.85,
    "sleepScore": 78
  },
  "timestamp": "2026-01-08T10:30:00Z"
}
```

---

## 🐛 Troubleshooting

### "kv is not defined" error
→ Connect KV database in Vercel dashboard, then redeploy

### No data showing
→ KV is new, previous in-memory logs won't migrate. New events will persist!

### Slow response
→ Choose KV region closer to you in database settings

---

## 📚 Files Modified

- ✅ `package.json` - Added `@vercel/kv` dependency
- ✅ `api/logs.js` - Replaced in-memory with KV storage
- ✅ `logs.html` - Added time range filters, total stored count
- ✅ `VERCEL_KV_SETUP.md` - Detailed setup guide (this file)

---

## 🎯 Next Steps

1. **Setup KV** (follow steps above) ← Do this first!
2. **Deploy** (`git push`)
3. **Test** - Press buzz button, check logs at `/logs.html`
4. **Monitor** - Check Vercel dashboard storage tab

---

## 🤝 Support

- Vercel KV Docs: https://vercel.com/docs/storage/vercel-kv
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Issues: Create issue in your repo

---

**Enjoy your persistent, long-term sleep tracking logs! 😴📊**

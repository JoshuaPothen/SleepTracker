# Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free tier works perfectly)
- Your code committed to GitHub

## Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to GitHub
```bash
cd "/Users/joshua/All Github Code/BLE Test/SleepTracker"

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Sleep Tracker with Vercel config"

# Create GitHub repo and push
# (Follow GitHub's instructions for creating a new repository)
git remote add origin https://github.com/JoshuaPothen/SleepTracker.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New" → "Project"
4. Import your `SleepTracker` repository
5. Keep all default settings (Vercel will auto-detect the configuration)
6. Click "Deploy"

### Step 3: Get Your Deployment URL
- After deployment, you'll get a URL like: `https://sleep-tracker-xxx.vercel.app`
- This is your production URL!

### Step 4: Update ESP32 Code
Update the `serverUrl` in your `esp32-code.ino`:
```cpp
const char* serverUrl = "https://your-project-name.vercel.app/api/sleep-data";
```

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
cd "/Users/joshua/All Github Code/BLE Test/SleepTracker"
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- What's your project's name? **sleep-tracker**
- In which directory is your code located? **./**
- Want to override settings? **N**

### Step 4: Deploy to Production
```bash
vercel --prod
```

## How It Works on Vercel

1. **Static Files**: `index.html` is served directly as a static file
2. **API Routes**: `api-server.js` runs as a serverless function
3. **Auto-scaling**: Vercel automatically scales based on traffic
4. **HTTPS**: Free SSL certificate included
5. **Global CDN**: Fast loading worldwide

## ESP32 Configuration

After deployment, update your ESP32 code:

```cpp
// Replace this line in esp32-code.ino
const char* serverUrl = "https://YOUR-PROJECT-NAME.vercel.app/api/sleep-data";

// Example:
const char* serverUrl = "https://sleep-tracker-joshua.vercel.app/api/sleep-data";
```

## Testing Your Deployment

### Test the Website
1. Open your Vercel URL in a browser
2. You should see the sleep tracker in demo mode

### Test the API
```bash
# Test POST endpoint (simulating ESP32)
curl -X POST https://your-project-name.vercel.app/api/sleep-data \
  -H "Content-Type: application/json" \
  -d '{"heart_rate":65,"breath_rate":15,"distance":0.8}'

# Test GET endpoint (what the website uses)
curl https://your-project-name.vercel.app/api/sleep-data
```

### Test with ESP32
1. Upload updated code to ESP32
2. Open Serial Monitor - you should see "Data sent successfully"
3. Refresh your Vercel website - data should update!

## Environment Variables (Optional)

If you want to add authentication or API keys:

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables like:
   - `API_KEY` = your-secret-key
3. Access in code: `process.env.API_KEY`

## Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `sleep.yourdomain.com`)
3. Follow DNS configuration instructions
4. Update ESP32 code with new domain

## Monitoring & Logs

- **Real-time Logs**: Vercel Dashboard → Your Project → Deployments → (click deployment) → Logs
- **Analytics**: Vercel Dashboard → Your Project → Analytics
- **Function Logs**: See API calls and responses in real-time

## Troubleshooting

### Website loads but shows "Disconnected"
- API might not be working - check Vercel function logs
- ESP32 might not be sending data - check Serial Monitor

### ESP32 can't connect
- Verify the URL is correct (https, not http)
- Check ESP32 has internet access
- Ensure WiFi credentials are correct

### CORS errors
- Already handled in `api-server.js` with `cors` middleware
- If issues persist, check browser console for specific errors

## Free Tier Limits

Vercel Free Tier includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ 100GB-hours serverless function execution
- ✅ Automatic HTTPS
- ✅ Global CDN

This is more than enough for a personal sleep tracker!

## Updating Your Deployment

### Automatic (Recommended)
- Just push to GitHub main branch
- Vercel auto-deploys

### Manual
```bash
vercel --prod
```

## Project Structure on Vercel

```
sleep-tracker.vercel.app/
├── /                    → index.html (static)
├── /api/sleep-data      → api-server.js (serverless function)
└── (all other files)    → static assets
```

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Update ESP32 with production URL
3. ✅ Test end-to-end
4. Optional: Add custom domain
5. Optional: Set up monitoring/alerts

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- This project's issues: https://github.com/JoshuaPothen/SleepTracker/issues

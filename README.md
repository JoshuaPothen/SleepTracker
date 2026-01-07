# Sleep Tracker

A real-time sleep monitoring website powered by the MR60BHA2 60GHz mmWave sensor on XIAO ESP32C6.

## Features

- 🌙 **Real-time Sleep State Detection**: Automatically detects Awake, Light Sleep, Deep Sleep states
- 💓 **Vital Monitoring**: Displays heart rate, breathing rate, and distance
- 🎨 **Dynamic Backgrounds**: Visual state changes with smooth gradient transitions
- 📊 **Sleep Score**: Calculates sleep quality based on vital signs
- 🔄 **Live Updates**: Refreshes data every 2 seconds
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Sleep State Logic

- **Deep Sleep**: Heart rate 40-60 BPM, Breathing 12-16 BPM, Distance ≤ 1.5m
- **Light Sleep**: Heart rate 60-70 BPM, Breathing 16-20 BPM, Distance ≤ 1.5m
- **Awake**: Heart rate > 70 BPM or irregular breathing
- **No Signal**: No valid sensor data

## Setup Instructions

### 1. Website Setup (GitHub Pages)

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Set source to `main` branch
4. Your site will be live at `https://yourusername.github.io/SleepTracker`

### 2. Local API Server (for testing)

Install node.js on machine, from nodejs.org
cd 'file location'

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The server will run on `http://localhost:3000`

### 3. ESP32C6 Setup

1. Install the Seeed mmWave library in Arduino IDE:
   Dowload the library from https://github.com/Love4yzp/Seeed-mmWave-library
   - Go to Sketch → Include Library → Manage Libraries
   - Search "Seeed mmWave" and install

3. Open `esp32-code.ino` in Arduino IDE

4. Update WiFi credentials:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```

5. Update server URL:
   ```cpp
   const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/sleep-data";
   ```

6. Select board: Tools → Board → esp32 → XIAO_ESP32C6

7. Upload to your XIAO ESP32C6

### 4. For GitHub Pages (Static Hosting)

Since GitHub Pages is static, you have two options for getting data:

#### Option A: Use a serverless function (Recommended)
- Deploy the API to Vercel/Netlify/AWS Lambda
- Update `API_ENDPOINT` in `index.html` to your serverless function URL

#### Option B: Direct ESP32 to GitHub API
- Use GitHub API to update a JSON file in your repo
- Website reads from that JSON file
- Requires GitHub personal access token on ESP32

## File Structure

```
SleepTracker/
├── index.html          # Main website
├── api-server.js       # Node.js API server (local testing)
├── esp32-code.ino      # Arduino code for ESP32C6
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## API Endpoints

### POST /api/sleep-data
Receives data from ESP32C6

**Request Body:**
```json
{
  "heart_rate": 65.5,
  "breath_rate": 15.2,
  "distance": 0.85
}
```

### GET /api/sleep-data
Returns latest sensor data

**Response:**
```json
{
  "heartRate": 65.5,
  "breathRate": 15.2,
  "distance": 0.85,
  "timestamp": "2026-01-06T12:34:56.789Z"
}
```

## Testing Without Hardware

The website includes demo data mode. If the API is unavailable, it will automatically cycle through different sleep states for testing purposes.

## Customization

### Adjust Sleep Thresholds

Edit the `determineSleepState()` function in `index.html`:

```javascript
// Deep sleep: Low heart rate (40-60 BPM) and low breathing rate (12-16 BPM)
if (heartRate >= 40 && heartRate <= 60 && breathRate >= 12 && breathRate <= 16) {
    return 'deep-sleep';
}
```

### Change Update Interval

```javascript
const UPDATE_INTERVAL = 2000; // milliseconds
```

### Modify Background Colors

```css
body.deep-sleep {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}
```

## Hardware Requirements

- XIAO ESP32C6
- MR60BHA2 60GHz mmWave Breathing and Heartbeat Sensor
- WiFi network
- USB-C cable for programming

## Sensor Specifications

- **Detection Range**: 
  - Breathing/Heartbeat: 1.5 meters
  - Presence: 6 meters
- **Accuracy**: Medical-grade detection
- **Update Rate**: Real-time continuous monitoring

## Troubleshooting

### Website shows "No Signal"
- Check ESP32 is powered and connected to WiFi
- Verify server URL is correct
- Check network connectivity

### Inaccurate readings
- Ensure sensor is positioned correctly (within 1.5m)
- Avoid metal surfaces and reflective materials
- Stay still during measurement

### Demo data stuck
- API endpoint not configured correctly
- Update `API_ENDPOINT` in `index.html`

## Resources

- [MR60BHA2 Documentation](https://wiki.seeedstudio.com/getting_started_with_mr60bha2_mmwave_kit/)
- [Seeed mmWave Library](https://github.com/Love4yzp/Seeed-mmWave-library)
- [XIAO ESP32C6 Guide](https://wiki.seeedstudio.com/xiao_esp32c6_getting_started/)

## License

MIT License - Feel free to modify and use for your projects!

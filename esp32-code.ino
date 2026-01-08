/*
 * ESP32C6 MR60BHA2 Sleep Tracker
 * Sends breathing and heartbeat data to web server
 * Receives buzz signals and controls NeoPixel LED
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "Seeed_Arduino_mmWave.h"
#include <Adafruit_NeoPixel.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server endpoints
const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/sleep-data";
const char* sleepDataUrl = "https://YOUR_VERCEL_APP.vercel.app/api/sleep-data";
const char* buzzCheckUrl = "https://YOUR_VERCEL_APP.vercel.app/api/buzz";

// NeoPixel setup
const int pixelPin = D1;
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(1, pixelPin, NEO_GRB + NEO_KHZ800);

// Serial communication for mmWave sensor
#ifdef ESP32
#include <HardwareSerial.h>
HardwareSerial mmWaveSerial(0);
#else
#define mmWaveSerial Serial1
#endif

SEEED_MR60BHA2 mmWave;

// Data collection variables
float lastHeartRate = 0;
float lastBreathRate = 0;
float lastDistance = 0;
unsigned long lastSendTime = 0;
unsigned long lastBuzzCheckTime = 0;
const unsigned long SEND_INTERVAL = 2000; // Send data every 2 seconds
const unsigned long BUZZ_CHECK_INTERVAL = 1000; // Check for buzz every 1 second

// LED state
bool ledActive = false;
unsigned long ledStartTime = 0;
const unsigned long LED_DURATION = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);
  Serial.println("Sleep Tracker Starting...");
  
  // Initialize NeoPixel
  pixels.begin();
  pixels.clear();
  pixels.show();
  Serial.println("NeoPixel initialized");
  
  // Initialize mmWave sensor
  mmWave.begin(&mmWaveSerial);
  Serial.println("mmWave sensor initialized");
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Startup animation
  startupAnimation();
}

void loop() {
  unsigned long currentTime = millis();
  
  // Update sensor data
  if (mmWave.update(100)) {
    float heartRate, breathRate, distance;
    
    // Get heart rate
    if (mmWave.getHeartRate(heartRate)) {
      lastHeartRate = heartRate;
    }
    
    // Get breathing rate
    if (mmWave.getBreathRate(breathRate)) {
      lastBreathRate = breathRate;
    }
    
    // Get distance
    if (mmWave.getDistance(distance)) {
      lastDistance = distance;
    }
    
    // Print to serial monitor
    Serial.printf("Heart Rate: %.2f BPM | Breath Rate: %.2f BPM | Distance: %.2f m\n", 
                  lastHeartRate, lastBreathRate, lastDistance);
  }
  
  // Send data to server at regular intervals
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    sendDataToServer();
    lastSendTime = currentTime;
  }
  
  // Check for buzz signal
  if (currentTime - lastBuzzCheckTime >= BUZZ_CHECK_INTERVAL) {
    checkBuzzSignal();
    lastBuzzCheckTime = currentTime;
  }
  
  // Manage LED state
  if (ledActive && (currentTime - ledStartTime >= LED_DURATION)) {
    // Turn off LED after duration
    pixels.clear();
    pixels.show();
    ledActive = false;
    Serial.println("LED turned off");
  }
}

void sendDataToServer() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(sleepDataUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    String jsonData = "{";
    jsonData += "\"heart_rate\":" + String(lastHeartRate, 2) + ",";
    jsonData += "\"breath_rate\":" + String(lastBreathRate, 2) + ",";
    jsonData += "\"distance\":" + String(lastDistance, 2);
    jsonData += "}";
    
    // Send POST request
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Data sent: " + response);
    } else {
      Serial.print("Error sending data: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }
}

void checkBuzzSignal() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(buzzCheckUrl);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      
      // Parse JSON response (simple parsing)
      if (response.indexOf("\"active\":true") > 0) {
        Serial.println("Buzz signal received!");
        activateLED();
      }
    }
    
    http.end();
  }
}

void activateLED() {
  // Set LED to blue
  pixels.setPixelColor(0, pixels.Color(0, 0, 255));
  pixels.show();
  ledActive = true;
  ledStartTime = millis();
  Serial.println("LED activated - Blue for 5 seconds");
}

void startupAnimation() {
  // Quick flash to show system is ready
  for (int i = 0; i < 3; i++) {
    pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // Green
    pixels.show();
    delay(200);
    pixels.clear();
    pixels.show();
    delay(200);
  }
}


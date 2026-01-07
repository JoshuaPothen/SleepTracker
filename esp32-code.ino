/*
 * ESP32C6 MR60BHA2 Sleep Tracker
 * Sends breathing and heartbeat data to web server
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "Seeed_Arduino_mmWave.h"

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Server endpoint
const char* serverUrl = "http://YOUR_SERVER_IP:3000/api/sleep-data";

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
const unsigned long SEND_INTERVAL = 2000; // Send data every 2 seconds

void setup() {
  Serial.begin(115200);
  Serial.println("Sleep Tracker Starting...");
  
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
}

void loop() {
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
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    sendDataToServer();
    lastSendTime = currentTime;
  }
}

void sendDataToServer() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(serverUrl);
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
      Serial.println("Data sent successfully: " + response);
    } else {
      Serial.print("Error sending data: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }
}

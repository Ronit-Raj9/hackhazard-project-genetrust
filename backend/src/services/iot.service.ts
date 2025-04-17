import { Server } from 'socket.io';
import http from 'http';
import SensorData, { addSensorReading, ISensorData } from '../models/sensor-data.model';
import logger from '../utils/logger';
import config from '../config';
import { getSensorInsights } from './groq.service';

let io: Server;
let sensorDataDocument: ISensorData | null = null;

// Store connected clients here
const connectedClients = new Set<string>();

/**
 * Initialize Socket.IO server
 * @param server HTTP server instance
 */
export const initializeSocketIO = (server: http.Server) => {
  // Create Socket.IO server
  io = new Server(server, {
    cors: {
      origin: config.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Handle connection
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);
    connectedClients.add(socket.id);

    // Send initial data
    if (sensorDataDocument) {
      socket.emit('initial-data', {
        temperature: sensorDataDocument.temperature.slice(-20),
        humidity: sensorDataDocument.humidity.slice(-20),
        pressure: sensorDataDocument.pressure?.slice(-20),
        light: sensorDataDocument.light?.slice(-20),
        co2: sensorDataDocument.co2?.slice(-20),
      });
    }

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
      connectedClients.delete(socket.id);
    });
  });

  logger.info('Socket.IO initialized');

  // Start simulating sensor data
  initializeSensorData();
};

/**
 * Initialize sensor data (create or load from database)
 */
export const initializeSensorData = async () => {
  try {
    // Find or create sensor data document
    let sensorData = await SensorData.findOne();
    
    if (!sensorData) {
      sensorData = await SensorData.create({});
      logger.info('Created new sensor data document');
    }
    
    sensorDataDocument = sensorData;
    
    // Start simulation
    startSensorSimulation();
  } catch (error) {
    logger.error('Error initializing sensor data:', error);
  }
};

/**
 * Start simulating sensor data
 */
export const startSensorSimulation = () => {
  // Generate data every 5 seconds
  setInterval(async () => {
    if (!sensorDataDocument || connectedClients.size === 0) return;
    
    try {
      // Get current values (or default if none exist)
      const currentTemp = sensorDataDocument.temperature.length > 0 
        ? sensorDataDocument.temperature[sensorDataDocument.temperature.length - 1].value 
        : 22;
      
      const currentHumidity = sensorDataDocument.humidity.length > 0 
        ? sensorDataDocument.humidity[sensorDataDocument.humidity.length - 1].value 
        : 45;

      // Simulate new values with small random changes
      const newTemp = Number((currentTemp + (Math.random() * 0.4 - 0.2)).toFixed(1));
      const newHumidity = Number((currentHumidity + (Math.random() * 2 - 1)).toFixed(1));
      
      // Add readings to document
      addSensorReading(sensorDataDocument, 'temperature', newTemp);
      addSensorReading(sensorDataDocument, 'humidity', newHumidity);
      
      // Save to database
      await sensorDataDocument.save();
      
      // Broadcast to connected clients
      const dataToSend = {
        temperature: { value: newTemp, timestamp: new Date() },
        humidity: { value: newHumidity, timestamp: new Date() },
      };
      
      io.emit('sensor-data', dataToSend);
      
      // Occasionally generate insights with Groq
      if (Math.random() < 0.1) { // 10% chance each update
        const insights = await getSensorInsights(newTemp, newHumidity);
        if (insights.success) {
          io.emit('sensor-insights', {
            message: insights.message,
            timestamp: new Date(),
          });
        }
      }
      
      // Check for concerning values
      if (newTemp > 25 || newTemp < 18 || newHumidity > 60 || newHumidity < 30) {
        const insights = await getSensorInsights(newTemp, newHumidity);
        if (insights.success) {
          io.emit('sensor-alert', {
            message: insights.message,
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      logger.error('Error in sensor simulation:', error);
    }
  }, 5000);
  
  logger.info('Sensor simulation started');
};

/**
 * Get latest sensor data
 */
export const getLatestSensorData = async () => {
  try {
    if (!sensorDataDocument) {
      // Try to get from database
      sensorDataDocument = await SensorData.findOne();
      
      if (!sensorDataDocument) {
        return {
          success: false,
          message: 'No sensor data available',
        };
      }
    }
    
    return {
      success: true,
      data: {
        temperature: sensorDataDocument.temperature.slice(-20),
        humidity: sensorDataDocument.humidity.slice(-20),
        pressure: sensorDataDocument.pressure?.slice(-20),
        light: sensorDataDocument.light?.slice(-20),
        co2: sensorDataDocument.co2?.slice(-20),
        lastUpdated: sensorDataDocument.lastUpdated,
      },
    };
  } catch (error) {
    logger.error('Error getting latest sensor data:', error);
    return {
      success: false,
      message: 'Failed to get sensor data',
    };
  }
}; 
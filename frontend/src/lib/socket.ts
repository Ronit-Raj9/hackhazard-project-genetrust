import { io, Socket } from 'socket.io-client';
import { useIoTStore } from './store';

let socket: Socket | null = null;

export const initializeSocket = () => {
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';
  
  if (socket) return socket;
  
  // Initialize socket connection
  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  
  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  // Initialize sensor data handlers
  setupSensorDataHandlers(socket);
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const setupSensorDataHandlers = (socket: Socket) => {
  const iotStore = useIoTStore.getState();
  
  // Initial data handler
  socket.on('initial-data', (data) => {
    iotStore.setReadings(data);
  });
  
  // Real-time sensor data handler
  socket.on('sensor-data', (data) => {
    if (data.temperature) {
      iotStore.addReading('temperature', data.temperature);
    }
    
    if (data.humidity) {
      iotStore.addReading('humidity', data.humidity);
    }
    
    if (data.pressure) {
      iotStore.addReading('pressure', data.pressure);
    }
    
    if (data.light) {
      iotStore.addReading('light', data.light);
    }
    
    if (data.co2) {
      iotStore.addReading('co2', data.co2);
    }
  });
  
  // Sensor insights handler
  socket.on('sensor-insights', (data) => {
    iotStore.setInsights(data.message);
  });
  
  // Sensor alert handler
  socket.on('sensor-alert', (data) => {
    // Here you could integrate with a toast notification system
    console.log('Sensor Alert:', data.message);
  });
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
}; 
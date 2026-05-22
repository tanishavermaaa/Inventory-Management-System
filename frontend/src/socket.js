import { io } from 'socket.io-client';

const socket = io('http://localhost:5001', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

// Global listener to confirm events arrive
socket.onAny((eventName, ...args) => {
  console.log('🔔 Socket event received:', eventName, args);
});

socket.on('connect_error', (err) => {
  console.log('❌ Socket error:', err.message);
});

export default socket;
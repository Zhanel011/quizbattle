const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const topicRoutes = require('./routes/topics');
const gameRoutes = require('./routes/games');
const messageRoutes = require('./routes/messages');
const inviteRoutes = require('./routes/invitations');

const app = express();
const server = http.createServer(app);

// WebSocket server (for chat & game sync)
const wss = new WebSocket.Server({ server });
const clients = new Map(); // userId -> ws

wss.on('connection', (ws, req) => {
  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'register') {
        clients.set(parsed.userId, ws);
        ws.userId = parsed.userId;
      }
      if (parsed.type === 'message' || parsed.type === 'invite') {
        const receiverWs = clients.get(parsed.receiverId);
        if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
          receiverWs.send(JSON.stringify(parsed));
        }
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    if (ws.userId) clients.delete(ws.userId);
  });
});

// Make wss accessible in routes
app.set('wss', wss);
app.set('clients', clients);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/invitations', inviteRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
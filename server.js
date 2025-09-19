// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const ADMIN_PASS = "3693398437"; // 🔑 ТВОЙ ПАРОЛЬ
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const sessions = {}; // { sessionId: {...} }

app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.json());

// Логин
app.post('/api/login', (req, res) => {
  if (req.body.password === ADMIN_PASS) {
    res.cookie('isAdmin', '1', { httpOnly: true });
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, error: 'Неверный пароль' });
});

// Создание сессии
app.post('/api/session', (req, res) => {
  if (req.cookies.isAdmin !== '1') return res.status(401).json({ error: 'Unauthorized' });

  const id = uuidv4();
  sessions[id] = {
    id,
    createdAt: Date.now(),
    adminConnected: false,
    clientConnected: false,
    messages: []
  };
  const link = `${req.protocol}://${req.get('host')}/client.html?sid=${id}`;
  res.json({ id, link });
});

// Список сессий
app.get('/api/sessions', (req, res) => {
  if (req.cookies.isAdmin !== '1') return res.status(401).json({ error: 'Unauthorized' });
  res.json(Object.values(sessions).sort((a, b) => b.createdAt - a.createdAt));
});

// WebSocket
io.on('connection', (socket) => {
  socket.on('join', ({ role, sid }) => {
    if (!sid || !sessions[sid]) return socket.emit('error', 'invalid session id');
    socket.join(sid);
    socket.data.sid = sid;
    socket.data.role = role;

    const s = sessions[sid];
    if (role === 'admin') s.adminConnected = true;
    if (role === 'client') s.clientConnected = true;

    socket.emit('history', s.messages);
    io.to(sid).emit('system', { msg: `${role} connected` });
  });

  socket.on('message', ({ text }) => {
    const sid = socket.data.sid;
    if (!sid || !sessions[sid]) return;
    const msg = { from: socket.data.role, text, ts: Date.now() };
    sessions[sid].messages.push(msg);
    io.to(sid).emit('message', msg);
  });

  socket.on('disconnect', () => {
    const sid = socket.data.sid;
    const s = sessions[sid];
    if (!s) return;
    if (socket.data.role === 'admin') s.adminConnected = false;
    if (socket.data.role === 'client') s.clientConnected = false;
    io.to(sid).emit('system', { msg: `${socket.data.role} disconnected` });
  });
});

server.listen(PORT, () => console.log(`🚀 Admin panel: http://localhost:${PORT}/admin.html`));

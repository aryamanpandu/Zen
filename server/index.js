const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const STORAGE_PATH = path.join(__dirname, 'storage.json');
const JWT_SECRET = process.env.JWT_SECRET || 'zen-dev-secret';

function readStorage() {
  return JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf8'));
}

function writeStorage(data) {
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2));
}

const app = express();
app.use(bodyParser.json());
app.use(cors());

// helpers
function ensureUserExists(username) {
  const data = readStorage();
  if (!data.userConfigs[username]) data.userConfigs[username] = [];
  if (!data.sessions[username]) data.sessions[username] = [];
  writeStorage(data);
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth' });
  const token = auth.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload.username;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Auth
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  const data = readStorage();
  if (data.users.find(u => u.username === username)) return res.status(400).json({ error: 'User exists' });
  const hashed = bcrypt.hashSync(password, 8);
  data.users.push({ username, password: hashed });
  data.userConfigs[username] = [];
  data.sessions[username] = [];
  writeStorage(data);
  return res.json({ ok: true });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const data = readStorage();
  const user = data.users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token });
});

// Configs
app.get('/api/configs', authMiddleware, (req, res) => {
  const data = readStorage();
  const user = req.user;
  ensureUserExists(user);
  const userConfigs = data.userConfigs[user] || [];
  const all = [data.configs.default, ...userConfigs];
  res.json(all);
});

app.post('/api/configs', authMiddleware, (req, res) => {
  const user = req.user;
  const { name, focusMinutes, shortBreakMinutes, longBreakMinutes, sessionsPerLongBreak } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  const data = readStorage();
  ensureUserExists(user);
  const id = `${user}-${Date.now()}`;
  const cfg = { id, name, focusMinutes: Number(focusMinutes), shortBreakMinutes: Number(shortBreakMinutes), longBreakMinutes: Number(longBreakMinutes), sessionsPerLongBreak: Number(sessionsPerLongBreak), owner: user };
  data.userConfigs[user].push(cfg);
  writeStorage(data);
  res.json(cfg);
});

app.put('/api/configs/:id', authMiddleware, (req, res) => {
  const user = req.user;
  const id = req.params.id;
  const data = readStorage();
  ensureUserExists(user);
  if (id === 'default') return res.status(403).json({ error: 'Default config cannot be modified' });
  const list = data.userConfigs[user] || [];
  const idx = list.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const updated = Object.assign(list[idx], req.body);
  list[idx] = updated;
  writeStorage(data);
  res.json(updated);
});

app.delete('/api/configs/:id', authMiddleware, (req, res) => {
  const user = req.user;
  const id = req.params.id;
  if (id === 'default') return res.status(403).json({ error: 'Default config cannot be deleted' });
  const data = readStorage();
  ensureUserExists(user);
  const list = data.userConfigs[user] || [];
  const idx = list.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  list.splice(idx, 1);
  writeStorage(data);
  res.json({ ok: true });
});

// Sessions: start, add distraction, save input
app.post('/api/session/start', authMiddleware, (req, res) => {
  const user = req.user;
  const { configId } = req.body;
  const data = readStorage();
  ensureUserExists(user);
  const id = `s-${Date.now()}`;
  const session = { id, configId: configId || 'default', startedAt: Date.now(), distractions: [], focusInput: '' };
  data.sessions[user].push(session);
  writeStorage(data);
  res.json(session);
});

app.post('/api/session/:id/distraction', authMiddleware, (req, res) => {
  const user = req.user;
  const sid = req.params.id;
  const { text } = req.body;
  const data = readStorage();
  const sessions = data.sessions[user] || [];
  const s = sessions.find(x => x.id === sid);
  if (!s) return res.status(404).json({ error: 'Session not found' });
  s.distractions.push({ text, at: Date.now() });
  writeStorage(data);
  res.json(s);
});

app.post('/api/session/:id/input', authMiddleware, (req, res) => {
  const user = req.user;
  const sid = req.params.id;
  const { input } = req.body;
  const data = readStorage();
  const sessions = data.sessions[user] || [];
  const s = sessions.find(x => x.id === sid);
  if (!s) return res.status(404).json({ error: 'Session not found' });
  s.focusInput = input;
  writeStorage(data);
  res.json(s);
});

// simple status
app.get('/api/ping', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Zen server listening on ${PORT}`));

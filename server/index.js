const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const docClient = require('./docClient');

const TABLE_NAME = 'zen-db';
const JWT_SECRET = process.env.JWT_SECRET || 'zen-dev-secret';

const app = express();
app.use(bodyParser.json());
app.use(cors());

// DynamoDB helpers
async function getUserByUsername(username) {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'UserID = :uid AND #type = :t',
      ExpressionAttributeNames: { '#type': 'Metadata' },
      ExpressionAttributeValues: { ':uid': username, ':t': 'user' }
    }));
    return result.Items?.[0] || null;
  } catch (e) {
    console.error('getUserByUsername error:', e);
    return null;
  }
}

async function getUserConfigs(username) {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'UserID = :uid AND begins_with(#meta, :prefix)',
      ExpressionAttributeNames: { '#meta': 'Metadata' },
      ExpressionAttributeValues: { ':uid': username, ':prefix': 'config#' }
    }));
    return result.Items || [];
  } catch (e) {
    console.error('getUserConfigs error:', e);
    return [];
  }
}

async function getUserSessions(username) {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'UserID = :uid AND begins_with(#meta, :prefix)',
      ExpressionAttributeNames: { '#meta': 'Metadata' },
      ExpressionAttributeValues: { ':uid': username, ':prefix': 'session#' }
    }));
    return result.Items || [];
  } catch (e) {
    console.error('getUserSessions error:', e);
    return [];
  }
}

async function getDefaultConfig() {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { UserID: 'system', Metadata: 'config#default' }
    }));
    return result.Item || {
      id: 'default',
      name: 'Default Pomodoro',
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      sessionsPerLongBreak: 4,
      owner: 'system'
    };
  } catch (e) {
    console.error('getDefaultConfig error:', e);
    return {
      id: 'default',
      name: 'Default Pomodoro',
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      sessionsPerLongBreak: 4,
      owner: 'system'
    };
  }
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
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    
    const existingUser = await getUserByUsername(username);
    if (existingUser) return res.status(400).json({ error: 'User exists' });
    
    const hashed = bcrypt.hashSync(password, 8);
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        UserID: username,
        Metadata: 'user',
        password: hashed,
        createdAt: Date.now()
      }
    }));
    
    return res.json({ ok: true });
  } catch (e) {
    console.error('Register error:', e);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);
    
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Configs
app.get('/api/configs', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const userConfigs = await getUserConfigs(user);
    const defaultConfig = await getDefaultConfig();
    res.json([defaultConfig, ...userConfigs]);
  } catch (e) {
    console.error('Get configs error:', e);
    res.status(500).json({ error: 'Failed to fetch configs' });
  }
});

app.post('/api/configs', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { name, focusMinutes, shortBreakMinutes, longBreakMinutes, sessionsPerLongBreak } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    
    const id = `${user}-${Date.now()}`;
    const cfg = {
      id,
      name,
      focusMinutes: Number(focusMinutes),
      shortBreakMinutes: Number(shortBreakMinutes),
      longBreakMinutes: Number(longBreakMinutes),
      sessionsPerLongBreak: Number(sessionsPerLongBreak),
      owner: user,
      createdAt: Date.now()
    };
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        UserID: user,
        Metadata: `config#${id}`,
        ...cfg
      }
    }));
    
    res.json(cfg);
  } catch (e) {
    console.error('Create config error:', e);
    res.status(500).json({ error: 'Failed to create config' });
  }
});

app.put('/api/configs/:id', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    
    if (id === 'default') return res.status(403).json({ error: 'Default config cannot be modified' });
    
    const userConfigs = await getUserConfigs(user);
    const cfg = userConfigs.find(c => c.id === id);
    
    if (!cfg) return res.status(404).json({ error: 'Not found' });
    
    const updated = Object.assign(cfg, req.body);
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        UserID: user,
        Metadata: `config#${id}`,
        ...updated
      }
    }));
    
    res.json(updated);
  } catch (e) {
    console.error('Update config error:', e);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

app.delete('/api/configs/:id', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    
    if (id === 'default') return res.status(403).json({ error: 'Default config cannot be deleted' });
    
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { UserID: user, Metadata: `config#${id}` }
    }));
    
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete config error:', e);
    res.status(500).json({ error: 'Failed to delete config' });
  }
});

// Sessions: start, add distraction, save input
app.post('/api/session/start', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { configId } = req.body;
    const sessionId = `s-${Date.now()}`;
    
    const session = {
      id: sessionId,
      configId: configId || 'default',
      startedAt: Date.now(),
      distractions: [],
      focusInput: ''
    };
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        UserID: user,
        Metadata: `session#${sessionId}`,
        ...session
      }
    }));
    
    res.json(session);
  } catch (e) {
    console.error('Start session error:', e);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

app.post('/api/session/:id/distraction', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const sessionId = req.params.id;
    const { text } = req.body;
    
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { UserID: user, Metadata: `session#${sessionId}` }
    }));
    
    if (!result.Item) return res.status(404).json({ error: 'Session not found' });
    
    const session = result.Item;
    session.distractions.push({ text, at: Date.now() });
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        UserID: user,
        Metadata: `session#${sessionId}`,
        ...session
      }
    }));
    
    res.json(session);
  } catch (e) {
    console.error('Add distraction error:', e);
    res.status(500).json({ error: 'Failed to add distraction' });
  }
});

app.post('/api/session/:id/input', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const sessionId = req.params.id;
    const { input } = req.body;
    
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { UserID: user, Metadata: `session#${sessionId}` }
    }));
    
    if (!result.Item) return res.status(404).json({ error: 'Session not found' });
    
    const session = result.Item;
    session.focusInput = input;
    
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        UserID: user,
        Metadata: `session#${sessionId}`,
        ...session
      }
    }));
    
    res.json(session);
  } catch (e) {
    console.error('Save input error:', e);
    res.status(500).json({ error: 'Failed to save input' });
  }
});

// simple status
app.get('/api/ping', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Zen server listening on ${PORT}`));

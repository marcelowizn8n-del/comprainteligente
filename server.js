require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

app.use(cors());
app.use(express.json());

// ── Auth Middleware ──
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

// ── Admin Middleware ──
function adminOnly(req, res, next) {
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(req.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  next();
}

// ── Plan Check Middleware ──
function activePlan(req, res, next) {
  const user = db.prepare('SELECT role, plan, trial_ends_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });
  if (user.role === 'admin') return next();
  if (user.plan === 'active') return next();
  if (user.plan === 'trial' && user.trial_ends_at && new Date(user.trial_ends_at) > new Date()) return next();
  return res.status(403).json({ error: 'trial_expired', message: 'Seu período de teste expirou. Assine para continuar.' });
}

function generateToken(user) {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

// ── Auth Routes ──
app.post('/api/register', (req, res) => {
  const { name, email, password, company } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres.' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const trialEnds = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const result = db.prepare('INSERT INTO users (name, email, password_hash, company, plan, trial_ends_at) VALUES (?, ?, ?, ?, ?, ?)').run(name, email, hash, company || '', 'trial', trialEnds);
  const user = { id: result.lastInsertRowid, name, email };
  const token = generateToken(user);
  res.json({ token, user: { ...user, plan: 'trial', trial_ends_at: trialEnds } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }
  const user = db.prepare('SELECT id, name, email, password_hash, role, plan, trial_ends_at FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, trial_ends_at: user.trial_ends_at } });
});

app.get('/api/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, company, role, plan, trial_ends_at, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  res.json({ user });
});

// ── Admin Routes ──
app.get('/api/admin/users', auth, adminOnly, (req, res) => {
  const users = db.prepare('SELECT id, name, email, company, role, plan, trial_ends_at, mp_subscription_id, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

app.post('/api/admin/users/:id/extend-trial', auth, adminOnly, (req, res) => {
  const { days } = req.body;
  const userId = req.params.id;
  const user = db.prepare('SELECT trial_ends_at FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  const baseDate = user.trial_ends_at ? new Date(user.trial_ends_at) : new Date();
  const newEnd = new Date(baseDate.getTime() + (days || 7) * 24 * 60 * 60 * 1000).toISOString();
  db.prepare('UPDATE users SET plan = ?, trial_ends_at = ? WHERE id = ?').run('trial', newEnd, userId);
  res.json({ success: true, trial_ends_at: newEnd });
});

app.post('/api/admin/users/:id/activate', auth, adminOnly, (req, res) => {
  db.prepare('UPDATE users SET plan = ? WHERE id = ?').run('active', req.params.id);
  res.json({ success: true });
});

app.post('/api/admin/users/:id/deactivate', auth, adminOnly, (req, res) => {
  db.prepare('UPDATE users SET plan = ? WHERE id = ?').run('cancelled', req.params.id);
  res.json({ success: true });
});

// ── Payment Routes (Mercado Pago) ──
app.post('/api/payment/create-subscription', auth, async (req, res) => {
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  try {
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + MP_ACCESS_TOKEN
      },
      body: JSON.stringify({
        reason: 'Compra Inteligente - Assinatura Mensal',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 800,
          currency_id: 'BRL'
        },
        payer_email: user.email,
        back_url: 'https://comprainteligente.tech/app',
        external_reference: String(user.id)
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(400).json({ error: data.message || 'Erro ao criar assinatura.' });
    }
    res.json({ init_point: data.init_point, id: data.id });
  } catch (err) {
    console.error('Erro Mercado Pago:', err);
    res.status(500).json({ error: 'Erro ao conectar com Mercado Pago.' });
  }
});

app.post('/api/payment/webhook', async (req, res) => {
  res.status(200).send('OK');

  const { type, data } = req.body;
  if (type !== 'subscription_preapproval') return;

  try {
    const response = await fetch('https://api.mercadopago.com/preapproval/' + data.id, {
      headers: { 'Authorization': 'Bearer ' + MP_ACCESS_TOKEN }
    });
    const sub = await response.json();

    if (sub.status === 'authorized') {
      const userId = parseInt(sub.external_reference);
      db.prepare('UPDATE users SET plan = ?, mp_subscription_id = ? WHERE id = ?').run('active', sub.id, userId);
    } else if (sub.status === 'cancelled' || sub.status === 'paused') {
      const userId = parseInt(sub.external_reference);
      db.prepare('UPDATE users SET plan = ? WHERE id = ?').run('cancelled', userId);
    }
  } catch (err) {
    console.error('Erro processando webhook MP:', err);
  }
});

app.get('/api/payment/status', auth, (req, res) => {
  const user = db.prepare('SELECT plan, trial_ends_at, mp_subscription_id FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

  let daysLeft = 0;
  if (user.plan === 'trial' && user.trial_ends_at) {
    daysLeft = Math.max(0, Math.ceil((new Date(user.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)));
  }
  res.json({ plan: user.plan, trial_ends_at: user.trial_ends_at, days_left: daysLeft, has_subscription: !!user.mp_subscription_id });
});

// ── Conversations Routes ──
app.get('/api/conversations', auth, activePlan, (req, res) => {
  const conversations = db.prepare('SELECT id, title, tool, created_at, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC').all(req.userId);
  res.json({ conversations });
});

app.post('/api/conversations', auth, activePlan, (req, res) => {
  const { title, tool } = req.body;
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO conversations (id, user_id, title, tool) VALUES (?, ?, ?, ?)').run(id, req.userId, title || 'Nova conversa', tool || 'chat');
  res.json({ id, title: title || 'Nova conversa' });
});

app.get('/api/conversations/:id/messages', auth, activePlan, (req, res) => {
  const conv = db.prepare('SELECT id FROM conversations WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!conv) return res.status(404).json({ error: 'Conversa não encontrada.' });
  const messages = db.prepare('SELECT role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json({ messages });
});

// ── Chat Route ──
app.post('/api/chat', auth, activePlan, async (req, res) => {
  const { messages, system, max_tokens, conversationId } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Campo "messages" obrigatório.' });
  }
  let convId = conversationId;
  if (!convId) {
    convId = crypto.randomUUID();
    const firstMsg = messages[messages.length - 1]?.content || 'Nova conversa';
    const title = firstMsg.substring(0, 60);
    db.prepare('INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)').run(convId, req.userId, title);
  }
  const lastUserMsg = messages[messages.length - 1];
  if (lastUserMsg && lastUserMsg.role === 'user') {
    db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(convId, 'user', lastUserMsg.content);
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1500,
        system: system || '',
        messages
      })
    });
    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'Erro na API Anthropic.' });
    }
    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)').run(convId, 'assistant', text);
    db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(convId);
    res.json({ text, conversationId: convId });
  } catch (err) {
    console.error('Erro ao chamar Anthropic:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ── Page Routes ──
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'landing.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/app', (req, res) => res.sendFile(path.join(__dirname, 'public', 'app.html')));
app.get('/pricing', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pricing.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/expired', (req, res) => res.sendFile(path.join(__dirname, 'public', 'expired.html')));

app.get('/powerpic', (req, res) => res.redirect('/?cliente=powerpic'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Compra Inteligente rodando em http://localhost:${PORT}`);
});

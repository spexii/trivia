import { WebSocketServer } from 'ws';
import { URL } from 'url';
import { verifyToken } from './auth.js';
import { handleCommand } from './commands.js';
import { updateStatsCorrect, resetStreaks } from './db.js';

export function startWsServer({ port, prisma, triviaLoop, activeSeason }) {
  const wss = new WebSocketServer({ port });
  const clients = new Map(); // ws → { nick, role }

  function send(ws, msg) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
  }

  function broadcast(msg) {
    const raw = JSON.stringify(msg);
    for (const [ws] of clients) {
      if (ws.readyState === ws.OPEN) ws.send(raw);
    }
  }

  function broadcastExcept(excludeWs, msg) {
    const raw = JSON.stringify(msg);
    for (const [ws] of clients) {
      if (ws !== excludeWs && ws.readyState === ws.OPEN) ws.send(raw);
    }
  }

  function userList() {
    return [...clients.values()].map(({ nick, role }) => ({ nick, role }));
  }

  triviaLoop.setBroadcast(broadcast);

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url ?? '/', `ws://localhost:${port}`);
    const token = url.searchParams.get('token');

    let identity;
    try {
      identity = verifyToken(token);
    } catch {
      send(ws, { type: 'error', code: 'AUTH_FAILED', message: 'Invalid token' });
      ws.close();
      return;
    }

    for (const [, info] of clients) {
      if (info.nick === identity.nick) {
        send(ws, { type: 'error', code: 'NICK_IN_USE', message: 'Already connected' });
        ws.close();
        return;
      }
    }

    clients.set(ws, { nick: identity.nick, role: identity.role });

    send(ws, { type: 'welcome', nick: identity.nick, role: identity.role });
    send(ws, { type: 'userlist', users: userList() });
    send(ws, { type: 'paused_state', paused: triviaLoop.isPaused });

    if (triviaLoop.currentQuestion) {
      send(ws, {
        type: 'question',
        questionNumber: triviaLoop.currentQuestion.questionNumber,
        text: triviaLoop.currentQuestion.question,
      });
    }

    broadcastExcept(ws, { type: 'userjoin', nick: identity.nick, role: identity.role });
    broadcast({ type: 'system', key: 'user_joined', params: { nick: identity.nick } });

    ws.on('message', async (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      const client = clients.get(ws);
      if (!client) return;
      const { nick, role } = client;

      if (msg.type === 'chat') {
        const text = String(msg.text ?? '').trim().slice(0, 500);
        if (!text) return;

        if (text.startsWith('!')) {
          const name = text.slice(1).toLowerCase().split(/\s+/)[0];
          await handleCommand({ name, nick, role, ws, triviaLoop, prisma, activeSeason, sendTo: send, broadcast });
          return;
        }

        const result = triviaLoop.checkAnswer(nick, role, text);
        if (result) {
          broadcast({ type: 'chat', nick, role, text, ts: Date.now() });
          const { totalPoints, currentStreak, rank } = await updateStatsCorrect(prisma, nick, activeSeason.id, result);
          await resetStreaks(prisma, activeSeason.id, nick);
          broadcast({
            type: 'correct',
            questionNumber: result.questionNumber,
            nick: result.nick,
            answer: text,
            points: result.points,
            totalPoints,
            elapsedMs: result.elapsedMs,
            wpm: result.wpm,
            streak: currentStreak,
            rank,
          });
          return;
        }

        broadcast({ type: 'chat', nick, role, text, ts: Date.now() });
      }

      if (msg.type === 'command') {
        const name = String(msg.name ?? '').toLowerCase();
        await handleCommand({ name, nick, role, ws, triviaLoop, prisma, activeSeason, sendTo: send, broadcast });
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      broadcast({ type: 'userleave', nick: identity.nick });
      broadcast({ type: 'system', key: 'user_left', params: { nick: identity.nick } });
    });

    ws.on('error', () => ws.close());
  });

  return { broadcast, wss };
}

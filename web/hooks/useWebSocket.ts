'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { ServerMessage, ClientMessage, Role } from '@/lib/types';

export type Identity = { nick: string; role: Role };
export type UserEntry = { nick: string; role: Role };

export interface WebSocketState {
  messages: ServerMessage[];
  users: UserEntry[];
  connected: boolean;
  identity: Identity | null;
  paused: boolean;
  sendMessage: (msg: ClientMessage) => void;
}

export function useWebSocket(wsUrl: string, token: string): WebSocketState {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(1000);
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [paused, setPaused] = useState(false);

  const addMessage = useCallback((msg: ServerMessage) =>
    setMessages(prev => [...prev.slice(-499), msg]), []);

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'welcome':
        setIdentity({ nick: msg.nick, role: msg.role });
        break;
      case 'userlist':
        setUsers(msg.users);
        break;
      case 'paused_state':
        setPaused(msg.paused);
        break;
      case 'userjoin':
        setUsers(prev => prev.some(u => u.nick === msg.nick) ? prev : [...prev, { nick: msg.nick, role: msg.role }]);
        addMessage(msg);
        break;
      case 'userleave':
        setUsers(prev => prev.filter(u => u.nick !== msg.nick));
        addMessage(msg);
        break;
      case 'system':
        if (msg.key === 'trivia_paused') setPaused(true);
        if (msg.key === 'trivia_resumed') setPaused(false);
        addMessage(msg);
        break;
      default:
        addMessage(msg);
    }
  }, [addMessage]);

  useEffect(() => {
    let cancelled = false;
    reconnectDelay.current = 1000;

    function connect() {
      if (cancelled) return;
      const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) { ws.close(); return; }
        setConnected(true);
        reconnectDelay.current = 1000;
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        try { handleMessage(JSON.parse(event.data) as ServerMessage); } catch { /* ignore */ }
      };

      ws.onclose = () => {
        if (cancelled) return;
        setConnected(false);
        const delay = reconnectDelay.current;
        reconnectDelay.current = Math.min(delay * 2, 30_000);
        setTimeout(connect, delay);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, [wsUrl, token, handleMessage]);

  const sendMessage = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { messages, users, connected, identity, paused, sendMessage };
}

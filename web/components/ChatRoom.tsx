'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useWebSocket } from '@/hooks/useWebSocket';
import TriviaHeader from './TriviaHeader';
import MessageList from './MessageList';
import UserList from './UserList';
import ChatInput from './ChatInput';
import type { Role } from '@/lib/types';

interface Props {
  token: string;
  nick: string;
  role: Role;
  wsUrl: string;
  locale: string;
}

export default function ChatRoom({ token, wsUrl }: Props) {
  const t = useTranslations('room');
  const { messages, users, connected, paused, sendMessage } = useWebSocket(wsUrl, token);
  const [showUsers, setShowUsers] = useState(false);

  function handleSend(text: string) {
    if (text.startsWith('!')) {
      const name = text.slice(1).toLowerCase().split(/\s+/)[0];
      sendMessage({ type: 'command', name });
    } else {
      sendMessage({ type: 'chat', text });
    }
  }

  return (
    <div className="flex flex-col h-dvh bg-zinc-900 text-zinc-100">
      <TriviaHeader messages={messages} connected={connected} paused={paused} />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <MessageList messages={messages} />
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <UserList users={users} />
        </div>
      </div>

      {/* Mobile: user list toggle + collapsible panel */}
      <div className="md:hidden border-t border-zinc-700">
        {showUsers && (
          <div className="max-h-32 overflow-y-auto bg-zinc-800">
            <ul className="py-1 px-2 flex flex-wrap gap-x-3">
              {users.map(u => (
                <li key={u.nick} className="text-sm text-zinc-400 py-0.5">
                  {u.nick}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={() => setShowUsers(v => !v)}
          className="w-full px-3 py-1.5 text-left text-xs text-zinc-500 hover:bg-zinc-800 flex items-center gap-1"
        >
          <span>{t('users_toggle', { count: users.length })}</span>
          <span className="ml-auto">{showUsers ? '▴' : '▾'}</span>
        </button>
      </div>

      <ChatInput onSend={handleSend} disabled={!connected} />
    </div>
  );
}

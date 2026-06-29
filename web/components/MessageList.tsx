'use client';
import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import type { ServerMessage } from '@/lib/types';

interface Props {
  messages: ServerMessage[];
}

export default function MessageList({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const bottom = bottomRef.current;
    if (!container || !bottom) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    if (isNearBottom) {
      bottom.scrollIntoView({ block: 'nearest' });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overscroll-contain py-2"
    >
      {messages.map((msg, i) => (
        <ChatMessage key={i} msg={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

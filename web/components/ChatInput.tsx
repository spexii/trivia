'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const t = useTranslations('room');
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-shrink-0 flex gap-2 p-2 border-t border-zinc-700 bg-zinc-900"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={disabled}
        placeholder={t('chat_placeholder')}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="flex-1 bg-zinc-800 text-zinc-100 rounded px-3 py-2 text-base placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 min-w-0"
        style={{ fontSize: '16px' }}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        suppressHydrationWarning
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded font-medium text-sm min-h-[44px] flex-shrink-0"
      >
        {t('send')}
      </button>
    </form>
  );
}

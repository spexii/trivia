'use client';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import type { ServerMessage } from '@/lib/types';

interface Props {
  messages: ServerMessage[];
  connected: boolean;
  paused: boolean;
}

export default function TriviaHeader({ messages, connected, paused }: Props) {
  const t = useTranslations('room');

  const question = [...messages].reverse().find(m => m.type === 'question');
  const questionText = question?.type === 'question' ? question.text : null;

  return (
    <div className="flex-shrink-0 bg-zinc-800 border-b border-zinc-700">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex-1 min-w-0">
          {!connected ? (
            <span className="text-yellow-400 text-sm">{paused ? '⏸ ' : ''}{t('connecting')}</span>
          ) : paused ? (
            <span className="text-yellow-400 text-sm font-medium">⏸ Paused</span>
          ) : questionText ? (
            <p className="text-sm font-medium text-zinc-100 truncate">{questionText}</p>
          ) : (
            <span className="text-zinc-500 text-sm">{t('trivia_waiting')}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}

'use client';
import { useTranslations } from 'next-intl';
import type { ServerMessage, Role } from '@/lib/types';

const roleColors: Record<Role, string> = {
  owner: 'text-red-400',
  moderator: 'text-blue-400',
  user: 'text-green-400',
  guest: 'text-zinc-400',
};

interface Props {
  msg: ServerMessage;
}

export default function ChatMessage({ msg }: Props) {
  const ts = useTranslations('system');
  const tt = useTranslations('trivia');
  const tr = useTranslations('room');

  if (msg.type === 'chat') {
    return (
      <div className="flex gap-2 items-baseline py-0.5 px-3 hover:bg-zinc-800/50">
        <span className={`font-bold text-sm flex-shrink-0 ${roleColors[msg.role]}`}>
          {msg.nick}
        </span>
        <span className="text-zinc-200 text-sm break-words min-w-0">{msg.text}</span>
      </div>
    );
  }

  if (msg.type === 'question') {
    return (
      <div className="px-3 py-1.5 my-1 bg-indigo-900/40 border-l-2 border-indigo-400">
        <span className="text-indigo-200 text-sm font-medium">{msg.text}</span>
      </div>
    );
  }

  if (msg.type === 'correct') {
    const time = (msg.elapsedMs / 1000).toFixed(3);
    return (
      <div className="px-3 py-1 my-0.5 bg-green-900/30 border-l-2 border-green-500">
        <span className="text-green-300 text-sm">
          {tt('correct', {
            nick: msg.nick,
            answer: msg.answer,
            time,
            streak: String(msg.streak),
            totalPoints: String(msg.totalPoints),
            wpm: String(msg.wpm),
            rank: String(msg.rank),
          })}
        </span>
      </div>
    );
  }

  if (msg.type === 'timeout') {
    return (
      <div className="px-3 py-1 my-0.5 bg-red-900/20 border-l-2 border-red-600">
        <span className="text-red-300 text-sm">
          {tt('timeout', { answer: msg.answer })}
        </span>
      </div>
    );
  }

  if (msg.type === 'hint') {
    return (
      <div className="px-3 py-1 my-0.5 bg-amber-900/20 border-l-2 border-amber-500">
        <span className="text-amber-500 text-xs mr-2">{tr('hint_label')} {msg.level}</span>
        <span className="text-amber-300 font-mono text-sm">{msg.hint}</span>
      </div>
    );
  }

  if (msg.type === 'system') {
    const text = (() => {
      try {
        return ts(msg.key, msg.params);
      } catch {
        return msg.key;
      }
    })();
    return (
      <div className="px-3 py-0.5">
        <span className="text-zinc-500 text-xs italic">{text}</span>
      </div>
    );
  }

  if (msg.type === 'userjoin') {
    return (
      <div className="px-3 py-0.5">
        <span className="text-zinc-500 text-xs italic">
          {ts('user_joined', { nick: msg.nick })}
        </span>
      </div>
    );
  }

  if (msg.type === 'userleave') {
    return (
      <div className="px-3 py-0.5">
        <span className="text-zinc-500 text-xs italic">
          {ts('user_left', { nick: msg.nick })}
        </span>
      </div>
    );
  }

  if (msg.type === 'personal_stats') {
    const s = msg.season;
    const a = msg.allTime;
    const fmtS = (ms: number) => ms > 0 ? `${(ms / 1000).toFixed(2)}s` : '—';
    const label = 'text-zinc-500 w-36 pr-2 align-top';
    const val = 'text-zinc-200';
    const sub = 'text-zinc-500 ml-1';
    return (
      <div className="px-3 py-2 my-1 bg-zinc-800 rounded border border-zinc-700 text-xs font-mono mx-3">
        <div className="text-zinc-300 font-bold mb-2">{tt('personal_title', { nick: msg.nick })}</div>
        <div className="grid grid-cols-2 gap-x-6">
          {/* Season */}
          <div>
            <div className="text-zinc-500 uppercase mb-1">{tt('personal_season', { seasonName: msg.seasonName })}</div>
            {s ? (
              <table className="text-left">
                <tbody>
                  <tr><td className={label}>{tt('personal_points')}</td><td className={val}>{s.points}</td></tr>
                  <tr><td className={label}>{tt('personal_won')}</td><td className={val}>{s.questionsWon}</td></tr>
                  <tr><td className={label}>{tt('personal_streak_current')}</td><td className={val}>{s.currentStreak}</td></tr>
                  <tr><td className={label}>{tt('personal_streak_best')}</td><td className={val}>{s.bestStreak}</td></tr>
                  {s.bestWpm > 0 && <tr><td className={label}>{tt('personal_wpm')}</td><td className={val}>{s.bestWpm}<span className={sub}>{s.bestWpmQuestion && `(${s.bestWpmQuestion})`}</span></td></tr>}
                  {s.quickestAnswerMs > 0 && <tr><td className={label}>{tt('personal_quickest')}</td><td className={val}>{fmtS(s.quickestAnswerMs)}<span className={sub}>{s.quickestQuestion && `(${s.quickestQuestion})`}</span></td></tr>}
                </tbody>
              </table>
            ) : (
              <div className="text-zinc-500">{tt('personal_no_season')}</div>
            )}
          </div>
          {/* All time */}
          <div>
            <div className="text-zinc-500 uppercase mb-1">{tt('personal_alltime')}</div>
            <table className="text-left">
              <tbody>
                <tr><td className={label}>{tt('personal_points')}</td><td className={val}>{a.points}</td></tr>
                <tr><td className={label}>{tt('personal_won')}</td><td className={val}>{a.questionsWon}</td></tr>
                <tr><td className={label}>{tt('personal_streak_best')}</td><td className={val}>{a.bestStreak}</td></tr>
                {a.bestWpm > 0 && <tr><td className={label}>{tt('personal_wpm')}</td><td className={val}>{a.bestWpm}<span className={sub}>{a.bestWpmQuestion && `(${a.bestWpmQuestion})`}</span></td></tr>}
                {a.quickestAnswerMs > 0 && <tr><td className={label}>{tt('personal_quickest')}</td><td className={val}>{fmtS(a.quickestAnswerMs)}<span className={sub}>{a.quickestQuestion && `(${a.quickestQuestion})`}</span></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (msg.type === 'stats') {
    const title = msg.subtype === 'season'
      ? tt('season_title', { seasonName: msg.seasonName ?? '' })
      : tt('hof_title');
    return (
      <div className="px-3 py-2 my-1 bg-zinc-800 rounded border border-zinc-700 text-xs font-mono mx-3">
        <div className="text-zinc-300 font-bold mb-1">{title}</div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-500">
              <th className="pr-2">{tt('stats_header_rank')}</th>
              <th className="pr-2">{tt('stats_header_nick')}</th>
              <th className="pr-2">{tt('stats_header_points')}</th>
              <th className="pr-2">{tt('stats_header_won')}</th>
              <th className="pr-2">{tt('stats_header_streak')}</th>
              <th>{tt('stats_header_wpm')}</th>
            </tr>
          </thead>
          <tbody>
            {msg.rows.map(row => (
              <tr key={row.nick} className="text-zinc-200">
                <td className="pr-2">{row.rank}</td>
                <td className="pr-2">{row.nick}</td>
                <td className="pr-2">{row.points}</td>
                <td className="pr-2">{row.questionsWon}</td>
                <td className="pr-2">{row.bestStreak}</td>
                <td>{row.bestWpm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

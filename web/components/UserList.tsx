'use client';
import { useTranslations } from 'next-intl';
import type { UserEntry } from '@/hooks/useWebSocket';
import type { Role } from '@/lib/types';

const roleColors: Record<Role, string> = {
  owner: 'text-red-400',
  moderator: 'text-blue-400',
  user: 'text-green-400',
  guest: 'text-zinc-500',
};

const roleBadge: Record<Role, string> = {
  owner: '@',
  moderator: '+',
  user: '',
  guest: '',
};

interface Props {
  users: UserEntry[];
}

export default function UserList({ users }: Props) {
  const t = useTranslations('room');

  return (
    <div className="w-40 flex-shrink-0 border-l border-zinc-700 overflow-y-auto">
      <div className="px-2 py-2 text-xs text-zinc-500 font-semibold uppercase tracking-wide border-b border-zinc-700">
        {t('users_header')} ({users.length})
      </div>
      <ul className="py-1">
        {users.map(u => (
          <li key={u.nick} className="px-2 py-0.5 flex items-baseline gap-0.5">
            {roleBadge[u.role] && (
              <span className={`text-xs ${roleColors[u.role]}`}>{roleBadge[u.role]}</span>
            )}
            <span className={`text-sm truncate ${roleColors[u.role]}`}>{u.nick}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

type Tab = 'guest' | 'login' | 'register';

interface Props {
  locale: string;
}

export default function LoginForm({ locale }: Props) {
  const t = useTranslations('login');
  const te = useTranslations('errors');
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('guest');
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint =
        tab === 'guest' ? '/api/guest' :
        tab === 'login' ? '/api/login' :
        '/api/register';

      const body =
        tab === 'guest'
          ? { nick: nick.trim() || undefined }
          : { nick: nick.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        const key = data.error as string;
        const knownKeys = ['NICK_TAKEN', 'NICK_INVALID', 'INVALID_CREDENTIALS', 'MISSING_FIELDS'];
        setError(knownKeys.includes(key) ? te(key as any) : te('UNKNOWN'));
        return;
      }

      router.push('/room');
    } catch {
      setError(te('UNKNOWN'));
    } finally {
      setLoading(false);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'guest', label: t('tab_guest') },
    { key: 'login', label: t('tab_login') },
    { key: 'register', label: t('tab_register') },
  ];

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-zinc-100">{t('title')}</h1>
        <p className="text-zinc-500 mt-1 text-sm">{t('subtitle')}</p>
      </div>

      <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-zinc-700">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTab(key); setError(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors min-h-[44px] ${
                tab === key
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-750'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Nick field */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{t('nick_label')}</label>
            <input
              type="text"
              value={nick}
              onChange={e => setNick(e.target.value)}
              placeholder={
                tab === 'guest' ? t('nick_placeholder') : t('nick_placeholder')
              }
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ fontSize: '16px' }}
            />
            {tab === 'guest' && (
              <p className="text-xs text-zinc-500 mt-1">{t('nick_random')}</p>
            )}
          </div>

          {/* Register nudge */}
          {tab === 'register' && (
            <p className="text-xs text-zinc-400 bg-zinc-900/60 rounded px-3 py-2 border border-zinc-700">
              {t('register_nudge')}
            </p>
          )}

          {/* Password field */}
          {tab !== 'guest' && (
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{t('password_label')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('password_placeholder')}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className="w-full bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ fontSize: '16px' }}
              />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 rounded px-3 py-2 border border-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold text-sm min-h-[48px] transition-colors"
          >
            {loading
              ? t('loading')
              : tab === 'guest'
              ? t('guest_submit')
              : tab === 'login'
              ? t('login_submit')
              : t('register_submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

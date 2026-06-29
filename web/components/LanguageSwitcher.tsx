'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex gap-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`px-2 py-1 text-xs rounded font-mono uppercase min-h-[32px] ${
            l === locale
              ? 'bg-zinc-600 text-white'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

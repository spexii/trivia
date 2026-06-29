import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fi'] as const,
  defaultLocale: 'en',
  localePrefix: 'always',
});

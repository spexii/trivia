import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('trivia-token')?.value;

  if (token) {
    try {
      verifyToken(token);
      redirect(`/${locale}/room`);
    } catch {
      // expired or invalid — fall through to login
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <LoginForm locale={locale} />
    </main>
  );
}

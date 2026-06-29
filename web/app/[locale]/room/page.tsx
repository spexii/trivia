import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import ChatRoom from '@/components/ChatRoom';
import type { Role } from '@/lib/types';

export default async function RoomPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('trivia-token')?.value;

  if (!token) redirect(`/${locale}`);

  let identity: { nick: string; role: Role };
  try {
    identity = verifyToken(token);
  } catch {
    redirect(`/${locale}`);
  }

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001';

  return (
    <ChatRoom
      token={token}
      nick={identity.nick}
      role={identity.role}
      wsUrl={wsUrl}
      locale={locale}
    />
  );
}

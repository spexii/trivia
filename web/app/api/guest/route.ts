import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

const NICK_RE = /^[a-zA-Z0-9_]{2,20}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  let nick = String(body?.nick ?? '').trim();

  if (nick) {
    if (!NICK_RE.test(nick)) {
      return NextResponse.json({ error: 'NICK_INVALID' }, { status: 400 });
    }
    const registered = await prisma.user.findUnique({ where: { nick } });
    if (registered) {
      return NextResponse.json({ error: 'NICK_TAKEN' }, { status: 409 });
    }
  } else {
    nick = 'Guest_' + randomBytes(3).toString('hex').toUpperCase();
  }

  const token = signToken({ nick, role: 'guest' });
  const res = NextResponse.json({ nick, role: 'guest' });
  res.cookies.set('trivia-token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
  return res;
}

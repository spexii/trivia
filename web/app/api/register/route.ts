import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

const NICK_RE = /^[a-zA-Z0-9_]{2,20}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const nick = String(body?.nick ?? '').trim();
  const password = String(body?.password ?? '');

  if (!nick || !password) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }
  if (!NICK_RE.test(nick)) {
    return NextResponse.json({ error: 'NICK_INVALID' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { nick } });
  if (existing) {
    return NextResponse.json({ error: 'NICK_TAKEN' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { nick, passwordHash, role: 'user' },
  });

  const token = signToken({ nick: user.nick, role: user.role as any });
  const res = NextResponse.json({ nick: user.nick, role: user.role });
  res.cookies.set('trivia-token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const nick = String(body?.nick ?? '').trim();
  const password = String(body?.password ?? '');

  if (!nick || !password) {
    return NextResponse.json({ error: 'MISSING_FIELDS' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { nick } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: 'INVALID_CREDENTIALS' }, { status: 401 });
  }

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

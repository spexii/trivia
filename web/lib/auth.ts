import jwt from 'jsonwebtoken';
import type { Role } from './types';

const JWT_SECRET = process.env.JWT_SECRET!;

export type TokenPayload = { nick: string; role: Role };

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

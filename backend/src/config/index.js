import 'dotenv/config';
import { cleanEnv, str, num, bool } from 'envalid';
import { PrismaClient } from '@prisma/client';


export const config = cleanEnv(process.env, {
  DATABASE_URL: str(),
  JWT_ACCESS_SECRET: str(),
  JWT_REFRESH_SECRET: str(),
  ACCESS_TOKEN_EXPIRY: str({ default: '15m' }),
  REFRESH_TOKEN_EXPIRY: str({ default: '7d' }),
  COOKIE_SECURE: bool({ default: true }),
  RATE_LIMIT_WINDOW: num({ default: 15 }),
  RATE_LIMIT_MAX: num({ default: 100 })
});

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
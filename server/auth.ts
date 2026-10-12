import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'bazaar_super_secure_jwt_secret_key_2026_94821038471';
export const AUTH_COOKIE_NAME = 'bazaar_auth_session';

// In-memory rate limiting tracker (per phone & per IP)
const phoneRateLimits = new Map<string, { lastSentAt: number; countInHour: number; hourStart: number }>();
const ipRateLimits = new Map<string, { count: number; windowStart: number }>();

/**
 * Normalizes Persian/Arabic numerals to standard English digits
 */
export function normalizeDigits(input: string): string {
  if (!input) return '';
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

/**
 * Normalizes and validates Iranian mobile phone numbers to 09XXXXXXXXX
 */
export function normalizeIranPhone(phone: string): { isValid: boolean; normalized: string } {
  if (!phone) return { isValid: false, normalized: '' };

  let clean = normalizeDigits(phone.trim().replace(/[\s\-_()]/g, ''));

  // Handle +98 or 0098 or 98 prefix
  if (clean.startsWith('+98')) {
    clean = '0' + clean.slice(3);
  } else if (clean.startsWith('0098')) {
    clean = '0' + clean.slice(4);
  } else if (clean.startsWith('98') && clean.length === 12) {
    clean = '0' + clean.slice(2);
  } else if (clean.startsWith('9') && clean.length === 10) {
    clean = '0' + clean;
  }

  // Must match 09 followed by 9 digits (total 11 digits)
  const isValid = /^09\d{9}$/.test(clean);

  return {
    isValid,
    normalized: clean,
  };
}

/**
 * Generates a 6-digit random numeric OTP
 */
export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generates a random cryptographic salt
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hashes OTP using HMAC-SHA256 with specific salt
 */
export function hashOtp(otp: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(otp.trim()).digest('hex');
}

/**
 * Compares plain OTP against stored hash in timing-safe manner
 */
export function verifyOtpHash(enteredOtp: string, storedHash: string, salt: string): boolean {
  const enteredHash = hashOtp(enteredOtp, salt);
  const hashBuffer = Buffer.from(enteredHash, 'hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');

  if (hashBuffer.length !== storedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, storedBuffer);
}

/**
 * Hashes passwords (if used)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies passwords (if used)
 */
export function verifyPassword(password: string, storedPasswordHash: string): boolean {
  try {
    const [salt, key] = storedPasswordHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

/**
 * Check Phone Send-OTP Rate Limit
 * Enforces minimum 115 seconds between sends, and max 6 per hour
 */
export function checkPhoneRateLimit(phone: string): { allowed: boolean; waitSeconds?: number; message?: string } {
  const now = Date.now();
  const record = phoneRateLimits.get(phone);

  if (!record) {
    phoneRateLimits.set(phone, { lastSentAt: now, countInHour: 1, hourStart: now });
    return { allowed: true };
  }

  // Cooldown check (2 minutes)
  const elapsedSeconds = Math.floor((now - record.lastSentAt) / 1000);
  const cooldownSeconds = 115; // 115s cooldown

  if (elapsedSeconds < cooldownSeconds) {
    const waitSeconds = cooldownSeconds - elapsedSeconds;
    return {
      allowed: false,
      waitSeconds,
      message: `لطفاً ${waitSeconds} ثانیه دیگر صبر کنید و سپس درخواست مجدد دهید.`,
    };
  }

  // Hour limit check (max 6 requests per hour)
  if (now - record.hourStart > 3600 * 1000) {
    record.hourStart = now;
    record.countInHour = 1;
  } else {
    record.countInHour += 1;
    if (record.countInHour > 6) {
      return {
        allowed: false,
        waitSeconds: Math.ceil((record.hourStart + 3600 * 1000 - now) / 1000),
        message: 'تعداد درخواست‌های پیامک برای این شماره بیش از حد مجاز است. لطفاً ساعتی دیگر تلاش کنید.',
      };
    }
  }

  record.lastSentAt = now;
  return { allowed: true };
}

/**
 * Generate JWT & Session Token
 */
export function createJwtToken(payload: { userId: string; phone: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Verify JWT Token
 */
export function verifyJwtToken(token: string): { userId: string; phone: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.userId && decoded.phone) {
      return { userId: decoded.userId, phone: decoded.phone, role: decoded.role || 'user' };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Set Secure HttpOnly Auth Cookie
 */
export function setAuthCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600 * 1000, // 30 days
    path: '/',
  });
}

/**
 * Clear Auth Cookie
 */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

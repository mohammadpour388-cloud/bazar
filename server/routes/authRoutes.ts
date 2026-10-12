import { Router, Request, Response } from 'express';
import {
  findUserByPhone,
  findUserById,
  findUserByEmail,
  findUserByUsername,
  createUser,
  saveOtpRecord,
  getLatestActiveOtp,
  incrementOtpAttempts,
  markOtpAsUsed,
  getRecentVerifiedOtpTime,
  createSession,
  deleteSessionByTokenHash,
  DbUser,
} from '../db';
import { getSmsProvider } from '../smsProvider';
import {
  normalizeIranPhone,
  normalizeDigits,
  generateOtp,
  generateSalt,
  hashOtp,
  verifyOtpHash,
  checkPhoneRateLimit,
  createJwtToken,
  verifyJwtToken,
  setAuthCookie,
  clearAuthCookie,
  AUTH_COOKIE_NAME,
} from '../auth';
import crypto from 'crypto';

export const authRouter = Router();

// Helper to sanitize DbUser to UserProfile format for client
function formatUserResponse(user: DbUser) {
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    username: user.username,
    email: user.email,
    city: user.city,
    district: user.district,
    avatar: user.avatar,
    role: user.role,
    walletBalance: user.wallet_balance,
    rating: user.rating,
    reviewsCount: user.reviews_count,
    memberSince: `${new Date().getFullYear() - new Date(user.created_at).getFullYear() || 1} سال در بازار`,
    isVerified: user.phone_verified,
    createdAt: user.created_at,
  };
}

/**
 * 1. POST /api/auth/send-otp
 * Receives mobile phone, validates, rate limits, generates OTP, hashes & saves to DB, sends via SMS Provider.
 */
authRouter.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPhone = req.body?.phone;
    if (!rawPhone || typeof rawPhone !== 'string') {
      res.status(400).json({
        success: false,
        error: 'شماره موبایل الزامی است.',
      });
      return;
    }

    const { isValid, normalized: phone } = normalizeIranPhone(rawPhone);
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'شماره موبایل وارد شده صحیح نیست. لطفاً شماره معتبر ۱۱ رقمی وارد نمایید (مثال: ۰۹۱۲۳۴۵۶۷۸۹).',
      });
      return;
    }

    // Rate Limit Check
    const rateLimit = checkPhoneRateLimit(phone);
    if (!rateLimit.allowed) {
      res.status(429).json({
        success: false,
        error: rateLimit.message || 'لطفاً کمی صبر کنید و دوباره تلاش کنید.',
        waitSeconds: rateLimit.waitSeconds,
      });
      return;
    }

    // Generate 6-digit OTP and unique salt
    const otp = generateOtp();
    const salt = generateSalt();
    const otpHash = hashOtp(otp, salt);

    // Save to Database with 120s expiry
    saveOtpRecord(phone, otpHash, salt, 120);

    // Dispatch SMS via Pluggable SMS Provider
    const smsProvider = getSmsProvider();
    const smsResult = await smsProvider.sendOtp(phone, otp);

    if (!smsResult.success) {
      console.error(`[SMS Error] Failed to send SMS via ${smsResult.provider}:`, smsResult.error);
      res.status(502).json({
        success: false,
        error: 'ارسال کد تأیید با مشکل مواجه شد. لطفاً دوباره تلاش کنید.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'کد تأیید ۶ رقمی از طریق پیامک به شماره شما ارسال گردید.',
      expiresIn: 120,
      phone,
    });
  } catch (error: any) {
    console.error('[Auth API] send-otp unhandled exception:', error);
    res.status(500).json({
      success: false,
      error: 'خطای غیرمنتظره سرور رخ داد. لطفاً مجدداً تلاش فرمایید.',
    });
  }
});

/**
 * 2. POST /api/auth/verify-otp
 * Verifies entered OTP against stored hash, handles expiration, attempts limit, and logs in or prompts registration.
 */
authRouter.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPhone = req.body?.phone;
    const rawOtp = req.body?.otp;

    if (!rawPhone || !rawOtp) {
      res.status(400).json({
        success: false,
        error: 'شماره موبایل و کد تأیید الزامی هستند.',
      });
      return;
    }

    const { isValid, normalized: phone } = normalizeIranPhone(String(rawPhone));
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'شماره موبایل نامعتبر است.',
      });
      return;
    }

    const enteredOtp = normalizeDigits(String(rawOtp).trim());
    if (enteredOtp.length !== 6 || !/^\d{6}$/.test(enteredOtp)) {
      res.status(400).json({
        success: false,
        error: 'کد تأیید باید ۶ رقم عددی باشد.',
      });
      return;
    }

    // Retrieve active OTP record from DB
    const activeOtp = getLatestActiveOtp(phone);
    if (!activeOtp) {
      res.status(400).json({
        success: false,
        error: 'کد تأیید منقضی شده است یا درخواستی ثبت نشده. لطفاً مجدداً کد دریافت کنید.',
      });
      return;
    }

    // Check maximum attempts (5 tries)
    if (activeOtp.attempts >= activeOtp.max_attempts) {
      markOtpAsUsed(activeOtp.id);
      res.status(400).json({
        success: false,
        error: 'تعداد تلاش‌های ناموفق بیش از حد مجاز بود. لطفاً کد جدید درخواست دهید.',
      });
      return;
    }

    // Timing-safe Hash Verification
    const isCorrect = verifyOtpHash(enteredOtp, activeOtp.otp_hash, activeOtp.salt);
    if (!isCorrect) {
      const attemptsSoFar = incrementOtpAttempts(activeOtp.id);
      const remaining = activeOtp.max_attempts - attemptsSoFar;
      res.status(400).json({
        success: false,
        error: `کد تأیید صحیح نیست. (${remaining} تلاش باقی‌مانده)`,
        remainingAttempts: remaining,
      });
      return;
    }

    // Mark OTP as verified and consumed
    markOtpAsUsed(activeOtp.id);

    // Check if user is already registered in DB
    const existingUser = findUserByPhone(phone);

    if (existingUser) {
      // Existing User -> Create Session & JWT Cookie
      const token = createJwtToken({
        userId: existingUser.id,
        phone: existingUser.phone,
        role: existingUser.role,
      });
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      createSession(
        existingUser.id,
        tokenHash,
        req.headers['user-agent'] || 'Unknown Browser',
        req.ip || '127.0.0.1'
      );

      setAuthCookie(res, token);

      res.status(200).json({
        success: true,
        isNewUser: false,
        user: formatUserResponse(existingUser),
        token,
        message: 'ورود با موفقیت انجام شد. خوش آمدید!',
      });
    } else {
      // New User -> Prompt complete registration
      res.status(200).json({
        success: true,
        isNewUser: true,
        phone,
        message: 'شماره همراه شما با موفقیت تأیید گردید. لطفاً نام و مشخصات خود را برای تکمیل ثبت‌نام وارد نمایید.',
      });
    }
  } catch (error: any) {
    console.error('[Auth API] verify-otp unhandled exception:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور در بررسی کد تأیید. لطفاً دوباره تلاش فرمایید.',
    });
  }
});

/**
 * 3. POST /api/auth/register
 * Completes registration for a verified phone number and establishes a persistent authenticated session.
 */
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone: rawPhone, name, username, email, city, district } = req.body;

    if (!rawPhone || !name) {
      res.status(400).json({
        success: false,
        error: 'شماره موبایل و نام و نام خانوادگی الزامی است.',
      });
      return;
    }

    const { isValid, normalized: phone } = normalizeIranPhone(String(rawPhone));
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'شماره موبایل نامعتبر است.',
      });
      return;
    }

    // Check if phone was recently verified (within last 30 minutes)
    const verifiedTime = getRecentVerifiedOtpTime(phone);
    if (!verifiedTime || Date.now() - verifiedTime > 30 * 60 * 1000) {
      res.status(400).json({
        success: false,
        error: 'شماره موبایل هنوز با کد پیامکی تأیید نشده است یا مهلت آن گذشته است. لطفاً ابتدا کد دریافت و تأیید کنید.',
      });
      return;
    }

    // Check uniqueness of Phone
    if (findUserByPhone(phone)) {
      res.status(400).json({
        success: false,
        error: 'حساب کاربری با این شماره موبایل قبلاً ثبت شده است. لطفاً وارد شوید.',
      });
      return;
    }

    // Check uniqueness of Username (if supplied)
    if (username && findUserByUsername(String(username))) {
      res.status(400).json({
        success: false,
        error: 'این نام کاربری قبلاً انتخاب شده است. لطفاً نام کاربری دیگری برگزینید.',
      });
      return;
    }

    // Check uniqueness of Email (if supplied)
    if (email && findUserByEmail(String(email))) {
      res.status(400).json({
        success: false,
        error: 'این آدرس ایمیل قبلاً در سیستم ثبت شده است.',
      });
      return;
    }

    // Create New User in Database
    const newUser = createUser({
      phone,
      name: String(name),
      username: username ? String(username) : undefined,
      email: email ? String(email) : undefined,
      city: city ? String(city) : undefined,
      district: district ? String(district) : undefined,
    });

    // Create Session & Issue Auth Token Cookie
    const token = createJwtToken({
      userId: newUser.id,
      phone: newUser.phone,
      role: newUser.role,
    });
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    createSession(
      newUser.id,
      tokenHash,
      req.headers['user-agent'] || 'Unknown Browser',
      req.ip || '127.0.0.1'
    );

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      user: formatUserResponse(newUser),
      token,
      message: 'ثبت‌نام شما با موفقیت تکمیل شد و حساب کاربری ایجاد گردید.',
    });
  } catch (error: any) {
    console.error('[Auth API] register unhandled exception:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور در ثبت‌نام کاربر. لطفاً مجدداً تلاش نمایید.',
    });
  }
});

/**
 * 4. POST /api/auth/login
 * User login via verified phone number or credentials
 */
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPhone = req.body?.phone;
    if (!rawPhone) {
      res.status(400).json({
        success: false,
        error: 'شماره موبایل الزامی است.',
      });
      return;
    }

    const { isValid, normalized: phone } = normalizeIranPhone(String(rawPhone));
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: 'شماره موبایل وارد شده صحیح نیست.',
      });
      return;
    }

    const user = findUserByPhone(phone);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'کاربری با این شماره موبایل یافت نشد. لطفاً ابتدا ثبت‌نام کنید.',
      });
      return;
    }

    // Issue new session
    const token = createJwtToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    createSession(
      user.id,
      tokenHash,
      req.headers['user-agent'] || 'Unknown Browser',
      req.ip || '127.0.0.1'
    );

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      user: formatUserResponse(user),
      token,
      message: 'ورود به حساب کاربری با موفقیت انجام شد.',
    });
  } catch (error: any) {
    console.error('[Auth API] login unhandled exception:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور در ورود به حساب.',
    });
  }
});

/**
 * 5. POST /api/auth/resend-otp
 * Resends a fresh OTP code to phone if cooldown has passed.
 */
authRouter.post('/resend-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const rawPhone = req.body?.phone;
    if (!rawPhone) {
      res.status(400).json({ success: false, error: 'شماره موبایل الزامی است.' });
      return;
    }

    const { isValid, normalized: phone } = normalizeIranPhone(String(rawPhone));
    if (!isValid) {
      res.status(400).json({ success: false, error: 'شماره موبایل نامعتبر است.' });
      return;
    }

    // Rate Limit Check
    const rateLimit = checkPhoneRateLimit(phone);
    if (!rateLimit.allowed) {
      res.status(429).json({
        success: false,
        error: rateLimit.message || 'لطفاً کمی صبر کنید و سپس دوباره تلاش کنید.',
        waitSeconds: rateLimit.waitSeconds,
      });
      return;
    }

    const otp = generateOtp();
    const salt = generateSalt();
    const otpHash = hashOtp(otp, salt);

    saveOtpRecord(phone, otpHash, salt, 120);

    const smsProvider = getSmsProvider();
    const smsResult = await smsProvider.sendOtp(phone, otp);

    if (!smsResult.success) {
      res.status(502).json({
        success: false,
        error: 'ارسال مجدد کد با مشکل مواجه شد. لطفاً دوباره تلاش نمایید.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'کد تأیید جدید مجدداً ارسال گردید.',
      expiresIn: 120,
    });
  } catch (error: any) {
    console.error('[Auth API] resend-otp unhandled exception:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور در ارسال مجدد کد تأیید.',
    });
  }
});

/**
 * 6. GET /api/auth/me
 * Retrieves current authenticated user information from Cookie or Bearer header.
 */
authRouter.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    let token = req.cookies?.[AUTH_COOKIE_NAME];

    // Fallback to Bearer token header if cookie not present
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7).trim();
    }

    if (!token) {
      res.status(200).json({
        authenticated: false,
        user: null,
      });
      return;
    }

    const payload = verifyJwtToken(token);
    if (!payload) {
      clearAuthCookie(res);
      res.status(200).json({
        authenticated: false,
        user: null,
      });
      return;
    }

    const user = findUserById(payload.userId);
    if (!user) {
      clearAuthCookie(res);
      res.status(200).json({
        authenticated: false,
        user: null,
      });
      return;
    }

    res.status(200).json({
      authenticated: true,
      user: formatUserResponse(user),
    });
  } catch (error: any) {
    console.error('[Auth API] me unhandled exception:', error);
    res.status(500).json({
      authenticated: false,
      user: null,
    });
  }
});

/**
 * 7. POST /api/auth/logout
 * Destroys session in database and clears authentication cookie.
 */
authRouter.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME] || req.headers.authorization?.slice(7);
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      deleteSessionByTokenHash(tokenHash);
    }

    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: 'خروج از حساب کاربری با موفقیت انجام شد.',
    });
  } catch (error: any) {
    console.error('[Auth API] logout unhandled exception:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در خروج از حساب کاربری.',
    });
  }
});

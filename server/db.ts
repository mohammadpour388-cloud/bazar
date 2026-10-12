import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface DbUser {
  id: string;
  phone: string;
  phone_verified: boolean;
  email: string | null;
  name: string;
  username: string;
  password_hash: string | null;
  city: string;
  district: string;
  avatar: string;
  role: 'user' | 'seller' | 'admin';
  wallet_balance: number;
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbOtpVerification {
  id: string;
  phone: string;
  otp_hash: string;
  salt: string;
  attempts: number;
  max_attempts: number;
  is_used: boolean;
  expires_at: number; // Unix timestamp ms
  created_at: string;
}

export interface DbSession {
  id: string;
  user_id: string;
  token_hash: string;
  user_agent: string;
  ip_address: string;
  expires_at: number; // Unix timestamp ms
  created_at: string;
}

export interface DbTransaction {
  id: string;
  user_id: string;
  type: 'wallet_deposit' | 'cart_purchase' | 'subscription' | 'ladder_promo';
  amount: number;
  description: string;
  status: 'pending' | 'success' | 'failed' | 'canceled';
  gateway: string;
  reference_id?: string;
  plan_type?: 'diamond' | 'golden' | 'standard';
  created_at: string;
  updated_at: string;
  verified_at?: string;
  error_message?: string;
}

interface DatabaseSchema {
  users: DbUser[];
  otp_verifications: DbOtpVerification[];
  sessions: DbSession[];
  transactions: DbTransaction[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// In-memory cache synced with persistent disk store
let dbMemory: DatabaseSchema = {
  users: [],
  otp_verifications: [],
  sessions: [],
  transactions: [],
};

// Seed default users if empty
function seedInitialUsers(): DbUser[] {
  return [
    {
      id: 'user_kamran',
      phone: '09123456789',
      phone_verified: true,
      email: 'kamran@example.com',
      name: 'کامران رضوانی',
      username: 'kamran_rezvani',
      password_hash: null,
      city: 'تهران',
      district: 'سعادت‌آباد',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDhpw_OzJWpDG4HJr8LniUJ_BA49LCgQz3j2sVBKDaGNX5w3nzC4RwO5XdZbbJxBiItPKyBYInBXVo7jkdaJdaSTdyomRicNQGE56xmgCYC40ij4xZzAJD4l0qgckIDYkfZALHFWml02Fqo5PXBBWfEFTmf81jrltLvqjqhc5EU4OaC_SyG0AmaVaU4ZeWAsi-B47OWTj6YJrh-ALxGVRgItMLMzvseD7gGnJYsg5U4xw_r0_dRFDF6Q',
      role: 'seller',
      wallet_balance: 250000,
      rating: 4.9,
      reviews_count: 38,
      created_at: new Date(Date.now() - 365 * 24 * 3600 * 1000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'user_seller_kambiz',
      phone: '09129876543',
      phone_verified: true,
      email: 'kambiz@example.com',
      name: 'کامبیز رضوانی',
      username: 'kambiz_store',
      password_hash: null,
      city: 'تهران',
      district: 'سعادت‌آباد',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPrNmRGkzZW4VHVjt9Bz4DusTs3FOgbCfqfk46y4eN0YaSgJZBcotMe2toQoqbzxpkIv0viRqy7i-7ApBgZQnrISULlpLJG1k5b7vXXeo9mhrjHiSo7L_b3eoW-hF6PQYzMBQh_a1sTalkcR8qQz5tIsUnNI2IF9Mqd38HxYdQlE0PkOu7KlEP2dPVyLtkitEXSVb4nM2kcaxxQfubjiQVdl7iA_TibAhbp6bONhrq2uxGLPgbXuHyoQ',
      role: 'seller',
      wallet_balance: 500000,
      rating: 4.9,
      reviews_count: 28,
      created_at: new Date(Date.now() - 365 * 24 * 3600 * 1000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

export function initDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbMemory = JSON.parse(content);
      if (!Array.isArray(dbMemory.users)) dbMemory.users = [];
      if (!Array.isArray(dbMemory.otp_verifications)) dbMemory.otp_verifications = [];
      if (!Array.isArray(dbMemory.sessions)) dbMemory.sessions = [];
      if (!Array.isArray(dbMemory.transactions)) dbMemory.transactions = [];
    } else {
      dbMemory = {
        users: seedInitialUsers(),
        otp_verifications: [],
        sessions: [],
        transactions: [],
      };
      saveDb();
    }
  } catch (err) {
    console.error('[DB] Failed to load database file, initializing clean memory:', err);
    dbMemory = {
      users: seedInitialUsers(),
      otp_verifications: [],
      sessions: [],
      transactions: [],
    };
    saveDb();
  }
}

function saveDb(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = DB_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(dbMemory, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[DB] Failed to save database to disk:', err);
  }
}

// --------------------------------------------------------------------------
// User Model Methods
// --------------------------------------------------------------------------

export function findUserByPhone(phone: string): DbUser | null {
  return dbMemory.users.find((u) => u.phone === phone) || null;
}

export function findUserById(id: string): DbUser | null {
  return dbMemory.users.find((u) => u.id === id) || null;
}

export function findUserByUsername(username: string): DbUser | null {
  return dbMemory.users.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export function findUserByEmail(email: string): DbUser | null {
  return dbMemory.users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function createUser(userData: {
  phone: string;
  name: string;
  username?: string;
  email?: string;
  password_hash?: string;
  city?: string;
  district?: string;
  avatar?: string;
  role?: 'user' | 'seller' | 'admin';
}): DbUser {
  // Generate clean unique username if not provided
  let generatedUsername = userData.username?.trim();
  if (!generatedUsername) {
    generatedUsername = `user_${userData.phone.slice(-4)}_${Math.floor(100 + Math.random() * 900)}`;
  }

  // Ensure username uniqueness
  let counter = 1;
  let finalUsername = generatedUsername;
  while (dbMemory.users.some((u) => u.username.toLowerCase() === finalUsername.toLowerCase())) {
    finalUsername = `${generatedUsername}_${counter}`;
    counter++;
  }

  const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`;

  const newUser: DbUser = {
    id: `u_${crypto.randomBytes(8).toString('hex')}`,
    phone: userData.phone,
    phone_verified: true,
    email: userData.email?.trim() || null,
    name: userData.name.trim(),
    username: finalUsername,
    password_hash: userData.password_hash || null,
    city: userData.city?.trim() || 'تهران',
    district: userData.district?.trim() || 'سعادت‌آباد',
    avatar: userData.avatar?.trim() || defaultAvatar,
    role: userData.role || 'user',
    wallet_balance: 50000, // Gift 50,000 Tomans sign-up welcome bonus!
    rating: 5.0,
    reviews_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbMemory.users.push(newUser);
  saveDb();
  return newUser;
}

export function updateUser(id: string, updates: Partial<DbUser>): DbUser | null {
  const idx = dbMemory.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  dbMemory.users[idx] = {
    ...dbMemory.users[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  saveDb();
  return dbMemory.users[idx];
}

// --------------------------------------------------------------------------
// OTP Model Methods
// --------------------------------------------------------------------------

export function saveOtpRecord(phone: string, otpHash: string, salt: string, ttlSeconds: number = 120): DbOtpVerification {
  const now = Date.now();
  
  // Invalidate any previous unverified OTPs for this phone
  dbMemory.otp_verifications.forEach((otp) => {
    if (otp.phone === phone && !otp.is_used) {
      otp.is_used = true;
    }
  });

  const record: DbOtpVerification = {
    id: `otp_${crypto.randomBytes(8).toString('hex')}`,
    phone,
    otp_hash: otpHash,
    salt,
    attempts: 0,
    max_attempts: 5,
    is_used: false,
    expires_at: now + ttlSeconds * 1000,
    created_at: new Date(now).toISOString(),
  };

  dbMemory.otp_verifications.push(record);
  saveDb();
  return record;
}

export function getLatestActiveOtp(phone: string): DbOtpVerification | null {
  const now = Date.now();
  const otps = dbMemory.otp_verifications
    .filter((o) => o.phone === phone && !o.is_used && o.expires_at > now)
    .sort((a, b) => b.expires_at - a.expires_at);

  return otps[0] || null;
}

export function incrementOtpAttempts(otpId: string): number {
  const record = dbMemory.otp_verifications.find((o) => o.id === otpId);
  if (!record) return 0;
  record.attempts += 1;
  saveDb();
  return record.attempts;
}

export function markOtpAsUsed(otpId: string): void {
  const record = dbMemory.otp_verifications.find((o) => o.id === otpId);
  if (record) {
    record.is_used = true;
    saveDb();
  }
}

export function getRecentVerifiedOtpTime(phone: string): number | null {
  const recentUsed = dbMemory.otp_verifications
    .filter((o) => o.phone === phone && o.is_used)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return recentUsed ? new Date(recentUsed.created_at).getTime() : null;
}

// --------------------------------------------------------------------------
// Session Model Methods
// --------------------------------------------------------------------------

export function createSession(userId: string, tokenHash: string, userAgent: string, ipAddress: string, ttlDays: number = 30): DbSession {
  const session: DbSession = {
    id: `sess_${crypto.randomBytes(12).toString('hex')}`,
    user_id: userId,
    token_hash: tokenHash,
    user_agent: userAgent,
    ip_address: ipAddress,
    expires_at: Date.now() + ttlDays * 24 * 3600 * 1000,
    created_at: new Date().toISOString(),
  };

  dbMemory.sessions.push(session);
  saveDb();
  return session;
}

export function findSessionByTokenHash(tokenHash: string): DbSession | null {
  const now = Date.now();
  const sess = dbMemory.sessions.find((s) => s.token_hash === tokenHash && s.expires_at > now);
  return sess || null;
}

export function deleteSessionByTokenHash(tokenHash: string): void {
  dbMemory.sessions = dbMemory.sessions.filter((s) => s.token_hash !== tokenHash);
  saveDb();
}

export function deleteSessionsByUserId(userId: string): void {
  dbMemory.sessions = dbMemory.sessions.filter((s) => s.user_id !== userId);
  saveDb();
}

// --------------------------------------------------------------------------
// Payment Transaction Methods
// --------------------------------------------------------------------------

export function createTransactionInDb(txData: {
  userId: string;
  type: 'wallet_deposit' | 'cart_purchase' | 'subscription' | 'ladder_promo';
  amount: number;
  description: string;
  gateway?: string;
  planType?: 'diamond' | 'golden' | 'standard';
}): DbTransaction {
  const now = new Date().toISOString();
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  const txnId = `TXN_${Date.now().toString().slice(-6)}_${randomSuffix}`;

  const newTx: DbTransaction = {
    id: txnId,
    user_id: txData.userId,
    type: txData.type,
    amount: Math.abs(txData.amount),
    description: txData.description,
    status: 'pending',
    gateway: txData.gateway || 'shaparak',
    plan_type: txData.planType,
    created_at: now,
    updated_at: now,
  };

  dbMemory.transactions.push(newTx);
  saveDb();
  return newTx;
}

export function findTransactionById(id: string): DbTransaction | null {
  return dbMemory.transactions.find((t) => t.id === id) || null;
}

export function getUserTransactionsFromDb(userId: string): DbTransaction[] {
  return dbMemory.transactions
    .filter((t) => t.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function verifyAndUpdateTransactionInDb(
  txId: string,
  gatewayStatus: 'success' | 'failed' | 'canceled',
  refNum?: string,
  errorMessage?: string
): {
  success: boolean;
  verified: boolean;
  alreadyVerified: boolean;
  transaction: DbTransaction | null;
  user: DbUser | null;
  message: string;
} {
  const tx = findTransactionById(txId);
  if (!tx) {
    return {
      success: false,
      verified: false,
      alreadyVerified: false,
      transaction: null,
      user: null,
      message: 'تراکنش با شناسه مشخص‌شده در پایگاه داده یافت نشد.',
    };
  }

  const user = findUserById(tx.user_id);
  if (!user) {
    return {
      success: false,
      verified: false,
      alreadyVerified: false,
      transaction: tx,
      user: null,
      message: 'کاربر مرتبط با این تراکنش یافت نشد.',
    };
  }

  // Double charge & Replay Protection:
  if (tx.status === 'success') {
    return {
      success: true,
      verified: true,
      alreadyVerified: true,
      transaction: tx,
      user,
      message: 'این تراکنش قبلاً با موفقیت تأیید شده است و کیف پول شارژ شده بود.',
    };
  }

  const now = new Date().toISOString();

  if (gatewayStatus === 'success') {
    // Verified by Server Backend API
    tx.status = 'success';
    tx.reference_id = refNum || `SHP_${Math.floor(100000000 + Math.random() * 900000000)}`;
    tx.verified_at = now;
    tx.updated_at = now;

    // Execute atomic wallet increase or subscription activation on Backend
    if (tx.type === 'wallet_deposit') {
      user.wallet_balance += tx.amount;
    } else if (tx.type === 'subscription' && tx.plan_type) {
      (user as any).subscription_plan = tx.plan_type;
    }

    saveDb();

    return {
      success: true,
      verified: true,
      alreadyVerified: false,
      transaction: tx,
      user,
      message: 'پرداخت با موفقیت توسط درگاه بانک استعلام و تأیید شد.',
    };
  } else {
    // Payment Failed, Canceled, or Unverified
    tx.status = gatewayStatus === 'canceled' ? 'canceled' : 'failed';
    tx.error_message = errorMessage || 'تراکنش توسط درگاه پرداخت تأیید نگردید.';
    tx.updated_at = now;

    saveDb();

    return {
      success: false,
      verified: false,
      alreadyVerified: false,
      transaction: tx,
      user, // Balance and subscription remain UNCHANGED!
      message:
        '❌ پرداخت تأیید نشد\nتراکنش شما توسط درگاه تأیید نشده است و مبلغی به کیف پول شما اضافه نشد. لطفاً دوباره تلاش کنید.',
    };
  }
}

export function payFromWalletInDb(
  userId: string,
  amount: number,
  description: string
): {
  success: boolean;
  transaction: DbTransaction | null;
  user: DbUser | null;
  message: string;
} {
  const user = findUserById(userId);
  if (!user) {
    return {
      success: false,
      transaction: null,
      user: null,
      message: 'کاربر یافت نشد.',
    };
  }

  if (user.wallet_balance < amount) {
    return {
      success: false,
      transaction: null,
      user,
      message: `موجودی کیف پول شما کافی نیست. (موجودی فعلی: ${user.wallet_balance.toLocaleString('fa-IR')} تومان)`,
    };
  }

  // Deduct atomically in Backend DB
  user.wallet_balance -= amount;

  const now = new Date().toISOString();
  const tx: DbTransaction = {
    id: `TXN_WLT_${Date.now().toString().slice(-6)}_${crypto.randomBytes(2).toString('hex')}`,
    user_id: userId,
    type: 'cart_purchase',
    amount: -amount,
    description,
    status: 'success',
    gateway: 'wallet',
    reference_id: `WLT_${Math.floor(100000 + Math.random() * 900000)}`,
    created_at: now,
    updated_at: now,
    verified_at: now,
  };

  dbMemory.transactions.push(tx);
  saveDb();

  return {
    success: true,
    transaction: tx,
    user,
    message: 'پرداخت با موفقیت از موجودی کیف پول انجام پذیرفت.',
  };
}

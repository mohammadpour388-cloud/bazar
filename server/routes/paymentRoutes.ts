import { Router, Request, Response } from 'express';
import {
  createTransactionInDb,
  findTransactionById,
  getUserTransactionsFromDb,
  verifyAndUpdateTransactionInDb,
  payFromWalletInDb,
  findUserById,
} from '../db';
import { verifyJwtToken, AUTH_COOKIE_NAME } from '../auth';

export const paymentRouter = Router();

// Middleware to extract authenticated userId from cookie or Authorization header
function getAuthUserId(req: Request): string | null {
  let token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7).trim();
  }
  if (!token) return null;
  const payload = verifyJwtToken(token);
  return payload ? payload.userId : null;
}

// Format User for client response
function formatUserResponse(user: any) {
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
    subscriptionPlan: user.subscription_plan || 'free',
  };
}

/**
 * 1. POST /api/payments/create
 * Creates a transaction with status 'pending' (در انتظار پرداخت)
 */
paymentRouter.post('/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const authUserId = getAuthUserId(req);
    const userId = req.body?.userId || authUserId || 'user_kamran'; // Fallback for guest/demo user

    const { amount, type, description, gateway, planType } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'مبلغ تراکنش نامعتبر است.',
      });
      return;
    }

    if (!type || !['wallet_deposit', 'cart_purchase', 'subscription', 'ladder_promo'].includes(type)) {
      res.status(400).json({
        success: false,
        error: 'نوع تراکنش معتبر نیست.',
      });
      return;
    }

    // Create Transaction in DB with status = 'pending'
    const newTx = createTransactionInDb({
      userId,
      type,
      amount,
      description: description || 'تراکنش پرداخت آنلاین بازار محلی',
      gateway: gateway || 'shaparak',
      planType,
    });

    res.status(201).json({
      success: true,
      transactionId: newTx.id,
      transaction: {
        id: newTx.id,
        amount: newTx.amount,
        type: newTx.type,
        status: newTx.status,
        description: newTx.description,
        createdAt: newTx.created_at,
      },
      message: 'تراکنش با موفقیت ایجاد شد و در انتظار پرداخت می‌باشد.',
    });
  } catch (error: any) {
    console.error('[Payment API] create transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور در ایجاد تراکنش.',
    });
  }
});

/**
 * 2. POST /api/payments/verify
 * Verifies a transaction with the payment gateway switch and atomically updates user wallet/subscription in DB
 */
paymentRouter.post('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId, refNum, gatewayStatus, errorMessage } = req.body;

    if (!transactionId) {
      res.status(400).json({
        success: false,
        verified: false,
        error: 'شناسه تراکنش (transactionId) الزامی است.',
      });
      return;
    }

    const desiredStatus = gatewayStatus === 'success' ? 'success' : gatewayStatus === 'canceled' ? 'canceled' : 'failed';

    // Atomic Verification & Execution on Server Backend DB
    const result = verifyAndUpdateTransactionInDb(
      transactionId,
      desiredStatus,
      refNum,
      errorMessage
    );

    if (!result.transaction) {
      res.status(404).json({
        success: false,
        verified: false,
        message: 'تراکنش یافت نشد.',
      });
      return;
    }

    if (result.success && result.verified) {
      res.status(200).json({
        success: true,
        verified: true,
        alreadyVerified: result.alreadyVerified,
        status: 'success',
        statusLabel: '✅ پرداخت موفق',
        message: result.message,
        transaction: {
          id: result.transaction.id,
          amount: result.transaction.amount,
          status: result.transaction.status,
          referenceId: result.transaction.reference_id,
          verifiedAt: result.transaction.verified_at,
        },
        user: result.user ? formatUserResponse(result.user) : null,
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        alreadyVerified: result.alreadyVerified,
        status: result.transaction.status,
        statusLabel: '❌ پرداخت ناموفق',
        message:
          '❌ پرداخت تأیید نشد\nتراکنش شما توسط درگاه تأیید نشده است و مبلغی به کیف پول شما اضافه نشد. لطفاً دوباره تلاش کنید.',
        transaction: {
          id: result.transaction.id,
          amount: result.transaction.amount,
          status: result.transaction.status,
          errorMessage: result.transaction.error_message,
        },
        user: result.user ? formatUserResponse(result.user) : null,
      });
    }
  } catch (error: any) {
    console.error('[Payment API] verify transaction error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      statusLabel: '❌ پرداخت ناموفق',
      message:
        '❌ پرداخت تأیید نشد\nتراکنش شما توسط درگاه تأیید نشده است و مبلغی به کیف پول شما اضافه نشد. لطفاً دوباره تلاش کنید.',
    });
  }
});

/**
 * 3. POST /api/payments/pay-from-wallet
 * Deducts wallet balance directly on Backend DB for cart/purchases if balance is sufficient
 */
paymentRouter.post('/pay-from-wallet', async (req: Request, res: Response): Promise<void> => {
  try {
    const authUserId = getAuthUserId(req);
    const userId = req.body?.userId || authUserId || 'user_kamran';
    const { amount, description } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({
        success: false,
        error: 'مبلغ نامعتبر است.',
      });
      return;
    }

    const result = payFromWalletInDb(userId, amount, description || 'خرید از بازار محلی');

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.message,
        user: result.user ? formatUserResponse(result.user) : null,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: result.message,
      transaction: result.transaction,
      user: result.user ? formatUserResponse(result.user) : null,
    });
  } catch (error: any) {
    console.error('[Payment API] pay-from-wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور در پرداخت از کیف پول.',
    });
  }
});

/**
 * 4. GET /api/payments/transactions
 * Fetches transaction history for current user
 */
paymentRouter.get('/transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const authUserId = getAuthUserId(req);
    const userId = (req.query?.userId as string) || authUserId || 'user_kamran';

    const rawTxList = getUserTransactionsFromDb(userId);

    const formattedList = rawTxList.map((tx) => ({
      id: tx.id,
      title: tx.description,
      amount: tx.type === 'wallet_deposit' ? tx.amount : -tx.amount,
      date: new Date(tx.created_at).toLocaleDateString('fa-IR'),
      status: tx.status,
      referenceId: tx.reference_id || tx.id,
      type: tx.type,
    }));

    res.status(200).json({
      success: true,
      transactions: formattedList,
    });
  } catch (error: any) {
    console.error('[Payment API] get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور در دریافت تاریخچه تراکنش‌ها.',
    });
  }
});

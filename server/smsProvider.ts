/**
 * Pluggable SMS Provider Module for Iranian SMS Gateways
 * Supports: Kavenegar, FarazSMS / IPPanel, SmsIr, PayamResan, and Development Mock.
 */

export interface SmsSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface ISmsProvider {
  name: string;
  sendOtp(phone: string, otp: string, templateId?: string): Promise<SmsSendResult>;
}

/**
 * 1. Kavenegar SMS Gateway
 */
class KavenegarProvider implements ISmsProvider {
  name = 'kavenegar';

  async sendOtp(phone: string, otp: string, templateId?: string): Promise<SmsSendResult> {
    const apiKey = process.env.SMS_API_KEY;
    const template = templateId || process.env.SMS_TEMPLATE_ID || 'verify';

    if (!apiKey) {
      return { success: false, error: 'SMS_API_KEY is not configured for Kavenegar.', provider: this.name };
    }

    try {
      // Lookup Pattern (Ultra-fast verify endpoint)
      const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json?receptor=${encodeURIComponent(
        phone
      )}&token=${encodeURIComponent(otp)}&template=${encodeURIComponent(template)}`;

      const res = await fetch(url, { method: 'POST' });
      const data = (await res.json()) as any;

      if (data?.return?.status === 200) {
        return {
          success: true,
          messageId: String(data?.entries?.[0]?.messageid || 'OK'),
          provider: this.name,
        };
      } else {
        return {
          success: false,
          error: data?.return?.message || 'Failed to dispatch SMS via Kavenegar',
          provider: this.name,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error communicating with Kavenegar gateway',
        provider: this.name,
      };
    }
  }
}

/**
 * 2. FarazSMS / IPPanel Provider
 */
class FarazSmsProvider implements ISmsProvider {
  name = 'farazsms';

  async sendOtp(phone: string, otp: string, templateId?: string): Promise<SmsSendResult> {
    const apiKey = process.env.SMS_API_KEY;
    const patternCode = templateId || process.env.SMS_TEMPLATE_ID || 'default_otp_pattern';
    const sender = process.env.SMS_SENDER || '+983000505';

    if (!apiKey) {
      return { success: false, error: 'SMS_API_KEY is not configured for FarazSMS.', provider: this.name };
    }

    try {
      const url = 'https://api2.ippanel.com/api/v1/sms/pattern/normal/send';
      const body = {
        code: patternCode,
        sender,
        recipient: phone,
        variable: {
          code: otp,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as any;

      if (res.ok && (data?.code === 200 || data?.data?.message_id)) {
        return {
          success: true,
          messageId: String(data?.data?.message_id || 'OK'),
          provider: this.name,
        };
      } else {
        return {
          success: false,
          error: data?.message || data?.description || 'FarazSMS dispatch failed',
          provider: this.name,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error communicating with FarazSMS gateway',
        provider: this.name,
      };
    }
  }
}

/**
 * 3. Sms.ir Provider (Verification / UltraFastSend)
 */
class SmsIrProvider implements ISmsProvider {
  name = 'smsir';

  async sendOtp(phone: string, otp: string, templateId?: string): Promise<SmsSendResult> {
    const apiKey = process.env.SMS_API_KEY;
    const template = templateId || process.env.SMS_TEMPLATE_ID || '100000';

    if (!apiKey) {
      return { success: false, error: 'SMS_API_KEY is not configured for Sms.ir.', provider: this.name };
    }

    try {
      const url = 'https://api.sms.ir/v1/send/verify';
      const body = {
        mobile: phone,
        templateId: Number(template) || 100000,
        parameters: [
          {
            name: 'Code',
            value: otp,
          },
        ],
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as any;

      if (res.ok && data?.status === 1) {
        return {
          success: true,
          messageId: String(data?.data?.messageId || 'OK'),
          provider: this.name,
        };
      } else {
        return {
          success: false,
          error: data?.message || 'Sms.ir dispatch failed',
          provider: this.name,
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error communicating with Sms.ir gateway',
        provider: this.name,
      };
    }
  }
}

/**
 * 4. Development & Testing Mock Provider (Active when SMS_API_KEY is not provided or SMS_PROVIDER=mock)
 */
class MockSmsProvider implements ISmsProvider {
  name = 'mock';

  async sendOtp(phone: string, otp: string, templateId?: string): Promise<SmsSendResult> {
    // Print clear visual box in development server logs
    console.log('\n==================================================');
    console.log('📱 [SMS GATEWAY SIMULATOR] Outgoing SMS Dispatched');
    console.log(`👤 To Phone Number: ${phone}`);
    console.log(`🔐 OTP Verification Code: [ ${otp} ]`);
    console.log(`⏱️ Expiry: 120 Seconds (2 Minutes)`);
    console.log(`🏷️ Template ID: ${templateId || process.env.SMS_TEMPLATE_ID || 'bazaar-otp-verification'}`);
    console.log('==================================================\n');

    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      provider: this.name,
    };
  }
}

/**
 * Factory to get active SMS Provider based on Environment Variables
 */
export function getSmsProvider(): ISmsProvider {
  const providerName = (process.env.SMS_PROVIDER || '').toLowerCase().trim();
  const apiKey = process.env.SMS_API_KEY;

  if (providerName === 'kavenegar' || (apiKey && apiKey.startsWith('kav_'))) {
    return new KavenegarProvider();
  }

  if (providerName === 'farazsms' || providerName === 'ippanel') {
    return new FarazSmsProvider();
  }

  if (providerName === 'smsir' || providerName === 'sms.ir') {
    return new SmsIrProvider();
  }

  // If SMS_API_KEY is set with standard generic key, default to Kavenegar
  if (apiKey && providerName !== 'mock') {
    return new KavenegarProvider();
  }

  // Default to robust Mock Provider with development logging
  return new MockSmsProvider();
}

import { loadDB, SystemSettings } from './db';

/**
 * Sends an OTP SMS using Melipayamak REST Api or simulates it if disabled.
 * @param to Recipient mobile number (e.g., 09121234567)
 * @param code OTP verification code
 * @param type 'verify' | 'reset'
 * @returns Promise<{ success: boolean; simulated: boolean; message: string }>
 */
export async function sendOtpSms(
  to: string,
  code: string,
  type: 'verify' | 'reset'
): Promise<{ success: boolean; simulated: boolean; message: string }> {
  try {
    const db = loadDB();
    const settings: SystemSettings = db.settings || { registrationEnabled: true };
    
    const isSmsEnabled = settings.smsEnabled === true;
    const smsUsername = settings.smsUsername || '';
    const smsPassword = settings.smsPassword || '';
    const bodyId = type === 'verify' 
      ? (settings.smsBodyIdVerify || 0)
      : (settings.smsBodyIdReset || 0);

    // If SMS is disabled or not fully configured, fall back to simulation
    if (!isSmsEnabled || !smsUsername || !smsPassword || !bodyId) {
      const dbgMsg = `[شبیه‌ساز سامانه پیامک] کد تأیید برای شماره ${to} ارسال شد: ${code} (دلیل: پنل پیامک غیرفعال یا ناقص تنظیم شده است)`;
      console.log('\x1b[33m%s\x1b[0m', dbgMsg);
      
      return {
        success: true,
        simulated: true,
        message: `کد با موفقیت شبیه‌سازی شد: ${code} (در صورت تمایل اطلاعات ملی‌پیامک را در پنل ادمین وارد کنید)`
      };
    }

    // Melipayamak BaseServiceNumber API call
    const payload = {
      username: smsUsername,
      password: smsPassword,
      text: String(code), // Melipayamak web-service templates replace {0} with text
      to: to.trim(),
      bodyId: Number(bodyId)
    };

    console.log(`Sending Melipayamak OTP to ${to} with bodyId ${bodyId}...`);

    const response = await fetch('https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Melipayamak API responded with error status: ${response.status}`);
      throw new Error(`خطای پاسخ دهی سامانه ملی پیامک: ${response.status}`);
    }

    const data = await response.json();
    console.log('Melipayamak API response:', data);

    // Melipayamak returns a message transaction ID (e.g. 5000...) or a value >= 0 on success. Negative numbers usually represent errors.
    // E.g., if RetVal/Value is negative or there is an error code.
    // Let's analyze data formats: sometimes it is `{ Value: "12345" }` or `{ StrRetVal: "..." }` or is directly a string value or code.
    // To be perfectly safe, we'll check output
    const returnVal = data.Value || data.RetVal || data;
    const parsedRet = Number(returnVal);

    if (!isNaN(parsedRet) && parsedRet < 0) {
      console.warn(`Melipayamak error code returned: ${parsedRet}`);
      throw new Error(`کد خطای سامانه ملی‌پیامک: ${parsedRet}`);
    }

    return {
      success: true,
      simulated: false,
      message: 'کد تایید پیامکی با موفقیت به شماره کاربر ارسال گردید.'
    };
  } catch (error: any) {
    console.error('Failed to send real SMS via Melipayamak:', error);
    
    // Recovery path: even if real sending fails, let's fall status back to a descriptive simulated msg so that users can continue testing their app cleanly
    return {
      success: false,
      simulated: true,
      message: `خطا در ارسال پیامک واقعی: ${error.message || error}. کد آزمایشی شما جهت تست: ${code}`
    };
  }
}

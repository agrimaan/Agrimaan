const axios = require('axios');

class SMSService {
  constructor() {
    // Using Twilio as primary SMS provider
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Alternative: TextLocal for Indian numbers
    this.textLocalApiKey = process.env.TEXTLOCAL_API_KEY;
    this.textLocalSender = process.env.TEXTLOCAL_SENDER || 'AGRIMN';
    
    // SMS provider preference
    this.provider = process.env.SMS_PROVIDER || 'twilio'; // 'twilio' or 'textlocal'
  }

  // Send OTP via SMS
  async sendOTP(phoneNumber, otp, userName = '') {
    const message = `Hello ${userName}, your Agrimaan verification code is: ${otp}. This code will expire in 10 minutes. Do not share this code with anyone.`;
    
    try {
      if (this.provider === 'twilio') {
        return await this.sendViaTwilio(phoneNumber, message);
      } else if (this.provider === 'textlocal') {
        return await this.sendViaTextLocal(phoneNumber, message);
      } else {
        throw new Error('Invalid SMS provider configured');
      }
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw new Error('Failed to send OTP SMS: ' + error.message);
    }
  }

  // Send welcome SMS
  async sendWelcomeSMS(phoneNumber, userName, role) {
    const message = `Welcome to Agrimaan, ${userName}! Your ${role} account is now active. Start exploring our agricultural platform. Download our app: ${process.env.APP_DOWNLOAD_URL || 'https://agrimaan.com/app'}`;
    
    try {
      if (this.provider === 'twilio') {
        return await this.sendViaTwilio(phoneNumber, message);
      } else if (this.provider === 'textlocal') {
        return await this.sendViaTextLocal(phoneNumber, message);
      }
    } catch (error) {
      console.error('Welcome SMS failed:', error);
      throw new Error('Failed to send welcome SMS');
    }
  }

  // Send notification SMS
  async sendNotificationSMS(phoneNumber, message, userName = '') {
    const formattedMessage = `Hello ${userName}, ${message} - Agrimaan`;
    
    try {
      if (this.provider === 'twilio') {
        return await this.sendViaTwilio(phoneNumber, formattedMessage);
      } else if (this.provider === 'textlocal') {
        return await this.sendViaTextLocal(phoneNumber, formattedMessage);
      }
    } catch (error) {
      console.error('Notification SMS failed:', error);
      throw new Error('Failed to send notification SMS');
    }
  }

  // Send via Twilio
  async sendViaTwilio(phoneNumber, message) {
    if (!this.twilioAccountSid || !this.twilioAuthToken || !this.twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`;
    
    const data = new URLSearchParams({
      From: this.twilioPhoneNumber,
      To: this.formatPhoneNumber(phoneNumber),
      Body: message
    });

    const config = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64')
      },
      data: data
    };

    try {
      const response = await axios(config);
      return {
        success: true,
        messageId: response.data.sid,
        status: response.data.status,
        provider: 'twilio'
      };
    } catch (error) {
      throw new Error(`Twilio SMS failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Send via TextLocal (for Indian numbers)
  async sendViaTextLocal(phoneNumber, message) {
    if (!this.textLocalApiKey) {
      throw new Error('TextLocal API key not configured');
    }

    const url = 'https://api.textlocal.in/send/';
    
    const data = new URLSearchParams({
      apikey: this.textLocalApiKey,
      numbers: this.formatPhoneNumberForTextLocal(phoneNumber),
      message: message,
      sender: this.textLocalSender
    });

    const config = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: data
    };

    try {
      const response = await axios(config);
      
      if (response.data.status === 'success') {
        return {
          success: true,
          messageId: response.data.messages[0]?.id,
          status: 'sent',
          provider: 'textlocal'
        };
      } else {
        throw new Error(`TextLocal error: ${response.data.errors?.[0]?.message || 'Unknown error'}`);
      }
    } catch (error) {
      throw new Error(`TextLocal SMS failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  // Send bulk SMS (with user preferences check)
  async sendBulkSMS(users, message) {
    const results = [];
    
    for (const user of users) {
      // Check user preferences
      if (!user.communicationPreferences?.sms?.marketing) {
        results.push({ 
          phone: user.phone?.number, 
          status: 'skipped', 
          reason: 'User opted out of SMS marketing' 
        });
        continue;
      }

      if (!user.phone?.number || !user.phone?.verified) {
        results.push({ 
          phone: user.phone?.number || 'N/A', 
          status: 'skipped', 
          reason: 'Phone number not verified or missing' 
        });
        continue;
      }

      try {
        const result = await this.sendNotificationSMS(user.phone.number, message, user.name);
        results.push({ 
          phone: user.phone.number, 
          status: 'sent',
          messageId: result.messageId 
        });
      } catch (error) {
        results.push({ 
          phone: user.phone.number, 
          status: 'failed', 
          error: error.message 
        });
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  // Format phone number for international format
  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    // Add + prefix
    return '+' + cleaned;
  }

  // Format phone number for TextLocal (Indian format)
  formatPhoneNumberForTextLocal(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Remove country code if present
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    }
    
    return cleaned;
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check for valid Indian mobile number
    if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
      return { valid: true, formatted: this.formatPhoneNumber(phoneNumber) };
    }
    
    // Check for international format
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      return { valid: true, formatted: this.formatPhoneNumber(phoneNumber) };
    }
    
    return { valid: false, error: 'Invalid phone number format' };
  }

  // Get SMS delivery status (Twilio only)
  async getSMSStatus(messageId) {
    if (this.provider !== 'twilio' || !messageId) {
      return { status: 'unknown', provider: this.provider };
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages/${messageId}.json`;
      
      const config = {
        method: 'GET',
        url: url,
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64')
        }
      };

      const response = await axios(config);
      return {
        status: response.data.status,
        errorCode: response.data.error_code,
        errorMessage: response.data.error_message,
        provider: 'twilio'
      };
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message,
        provider: 'twilio' 
      };
    }
  }

  // Test SMS configuration
  async testSMSConfiguration(testPhoneNumber) {
    try {
      const testMessage = 'This is a test message from Agrimaan. SMS configuration is working correctly.';
      const result = await this.sendNotificationSMS(testPhoneNumber, testMessage, 'Test User');
      return { 
        success: true, 
        message: 'SMS configuration test successful',
        provider: this.provider,
        messageId: result.messageId
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'SMS configuration test failed: ' + error.message,
        provider: this.provider
      };
    }
  }
}

module.exports = new SMSService();
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Send email verification
  async sendEmailVerification(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${user.email}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email - Agrimaan</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2E7D32; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Agrimaan!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Thank you for registering with Agrimaan. To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with Agrimaan, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Agrimaan. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Agrimaan" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Verify Your Email Address - Agrimaan',
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Send welcome email after verification
  async sendWelcomeEmail(user) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Agrimaan!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2E7D32; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Agrimaan!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Your email has been successfully verified! Welcome to the Agrimaan community.</p>
            <p>As a ${user.role}, you now have access to:</p>
            <ul>
              <li>Advanced agricultural management tools</li>
              <li>Real-time market insights</li>
              <li>IoT sensor integration</li>
              <li>Supply chain tracking</li>
              <li>Community marketplace</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Agrimaan. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Agrimaan" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Welcome to Agrimaan - Your Account is Ready!',
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  // Send admin verification notification
  async sendAdminVerificationNotification(user, admin) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New User Verification Required - Agrimaan Admin</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #FF9800; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .user-info { background: white; padding: 15px; border-left: 4px solid #FF9800; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>User Verification Required</h1>
          </div>
          <div class="content">
            <h2>Hello Admin,</h2>
            <p>A new user has registered and requires verification:</p>
            <div class="user-info">
              <strong>Name:</strong> ${user.name}<br>
              <strong>Email:</strong> ${user.email}<br>
              <strong>Role:</strong> ${user.role}<br>
              <strong>Phone:</strong> ${user.phone?.number || 'Not provided'}<br>
              <strong>Registration Date:</strong> ${new Date(user.createdAt).toLocaleDateString()}
            </div>
            <a href="${process.env.FRONTEND_URL}/admin/users/${user._id}" class="button">Review User</a>
            <p>Please review and verify this user account in the admin panel.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Agrimaan Admin" <${process.env.SMTP_USER}>`,
      to: admin.email,
      subject: 'New User Verification Required - Agrimaan',
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Admin notification sent successfully' };
    } catch (error) {
      console.error('Admin notification email failed:', error);
      throw new Error('Failed to send admin notification');
    }
  }

  // Send bulk upload completion notification
  async sendBulkUploadNotification(admin, uploadResult) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bulk Upload Completed - Agrimaan</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .stats { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .success { color: #4CAF50; }
          .error { color: #F44336; }
          .warning { color: #FF9800; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bulk Upload Completed</h1>
          </div>
          <div class="content">
            <h2>Hello ${admin.name},</h2>
            <p>Your bulk upload has been completed. Here's the summary:</p>
            <div class="stats">
              <strong>File:</strong> ${uploadResult.originalFileName}<br>
              <strong>Upload Type:</strong> ${uploadResult.uploadType}<br>
              <strong>Status:</strong> ${uploadResult.status}<br><br>
              <strong>Results:</strong><br>
              <span class="success">✓ Successful: ${uploadResult.successfulRecords}</span><br>
              <span class="error">✗ Failed: ${uploadResult.failedRecords}</span><br>
              <span class="warning">⚠ Total: ${uploadResult.totalRecords}</span>
            </div>
            <p>Processing Time: ${uploadResult.processingTime}ms</p>
            ${uploadResult.errors.length > 0 ? `<p><strong>Errors encountered:</strong> ${uploadResult.errors.length} errors found. Please check the admin panel for details.</p>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Agrimaan" <${process.env.SMTP_USER}>`,
      to: admin.email,
      subject: `Bulk Upload ${uploadResult.status} - ${uploadResult.originalFileName}`,
      html: htmlContent
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Bulk upload notification sent successfully' };
    } catch (error) {
      console.error('Bulk upload notification failed:', error);
      throw new Error('Failed to send bulk upload notification');
    }
  }

  // Send marketing/promotional emails (with user preferences check)
  async sendMarketingEmail(users, subject, content) {
    const results = [];
    
    for (const user of users) {
      // Check user preferences
      if (!user.communicationPreferences?.email?.marketing) {
        results.push({ 
          email: user.email, 
          status: 'skipped', 
          reason: 'User opted out of marketing emails' 
        });
        continue;
      }

      const mailOptions = {
        from: `"Agrimaan" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: subject,
        html: content
      };

      try {
        await this.transporter.sendMail(mailOptions);
        results.push({ email: user.email, status: 'sent' });
      } catch (error) {
        results.push({ 
          email: user.email, 
          status: 'failed', 
          error: error.message 
        });
      }
    }

    return results;
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      await this.transporter.verify();
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      return { success: false, message: 'Email configuration failed: ' + error.message };
    }
  }
}

module.exports = new EmailService();
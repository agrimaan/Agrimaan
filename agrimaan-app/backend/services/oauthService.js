const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

class OAuthService {
  constructor() {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  // Generate Google OAuth URL
  generateGoogleAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    return this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Verify Google OAuth token
  async verifyGoogleToken(token) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      throw new Error('Invalid Google token');
    }
  }

  // Handle Google OAuth callback
  async handleGoogleCallback(code) {
    try {
      const { tokens } = await this.googleClient.getToken(code);
      this.googleClient.setCredentials(tokens);

      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
      };
    } catch (error) {
      throw new Error('Failed to process Google OAuth callback');
    }
  }

  // Find or create user from Google OAuth
  async findOrCreateGoogleUser(googleData, additionalData = {}) {
    try {
      // Check if user already exists with Google ID
      let user = await User.findOne({ 'oauth.googleId': googleData.googleId });
      
      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        return user;
      }

      // Check if user exists with same email
      user = await User.findOne({ email: googleData.email });
      
      if (user) {
        // Link Google account to existing user
        user.oauth = {
          googleId: googleData.googleId,
          googleEmail: googleData.email,
          provider: 'google'
        };
        user.emailVerification.verified = googleData.emailVerified;
        user.lastLogin = new Date();
        
        if (googleData.picture && !user.profileImage) {
          user.profileImage = googleData.picture;
        }
        
        await user.save();
        return user;
      }

      // Create new user
      user = new User({
        name: googleData.name,
        email: googleData.email,
        oauth: {
          googleId: googleData.googleId,
          googleEmail: googleData.email,
          provider: 'google'
        },
        emailVerification: {
          verified: googleData.emailVerified
        },
        profileImage: googleData.picture,
        role: additionalData.role || 'farmer',
        verificationStatus: 'unverified',
        lastLogin: new Date(),
        ...additionalData
      });

      await user.save();
      return user;
    } catch (error) {
      throw new Error('Failed to create or find Google user: ' + error.message);
    }
  }

  // Generate JWT token for OAuth user
  generateJWTToken(user) {
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        provider: user.oauth?.provider || 'local'
      }
    };

    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Unlink OAuth account
  async unlinkOAuthAccount(userId, provider) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (provider === 'google') {
        user.oauth.googleId = undefined;
        user.oauth.googleEmail = undefined;
        if (user.oauth.provider === 'google') {
          user.oauth.provider = 'local';
        }
      }

      await user.save();
      return user;
    } catch (error) {
      throw new Error('Failed to unlink OAuth account: ' + error.message);
    }
  }

  // Get OAuth account info
  async getOAuthAccountInfo(userId) {
    try {
      const user = await User.findById(userId).select('oauth email name');
      if (!user) {
        throw new Error('User not found');
      }

      return {
        hasGoogleAccount: !!user.oauth?.googleId,
        provider: user.oauth?.provider || 'local',
        googleEmail: user.oauth?.googleEmail,
        email: user.email
      };
    } catch (error) {
      throw new Error('Failed to get OAuth account info: ' + error.message);
    }
  }
}

module.exports = new OAuthService();
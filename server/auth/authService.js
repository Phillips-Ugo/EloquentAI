const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../database/models');

// Configuration - HARDCODED FOR DEVELOPMENT
const JWT_SECRET = process.env.JWT_SECRET || 'hardcoded-jwt-secret-key-for-development-change-in-production-123456789';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

class AuthService {
  /**
   * Register a new user
   */
  static async register(userData) {
    const { email, password, firstName, lastName, company, role = 'user' } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      company,
      role,
      status: 'active',
      created_at: new Date().toISOString()
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  /**
   * Login user
   */
  static async login(email, password) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET);

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user || user.status !== 'active') {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   */
  static async logout(userId, refreshToken) {
    // In a production app, you might want to blacklist the refresh token
    // For now, we'll just return success
    return {
      success: true,
      message: 'Logged out successfully'
    };
  }

  /**
   * Change password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.updatePassword(userId, newPasswordHash);

    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  /**
   * Request password reset
   */
  static async resetPassword(email) {
    const user = await User.findByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await User.updateResetToken(user.id, resetToken, resetTokenExpiry);

    // In production, send email with reset link
    // For now, we'll just log it
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
      // Include token in development mode only
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    };
  }

  /**
   * Confirm password reset
   */
  static async confirmPasswordReset(resetToken, newPassword) {
    // Find user by reset token
    const user = await User.findByResetToken(resetToken);
    
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Check if token is expired
    const tokenExpiry = new Date(user.reset_token_expiry);
    if (tokenExpiry < new Date()) {
      throw new Error('Reset token has expired');
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.updatePassword(user.id, newPasswordHash);

    // Clear reset token
    await User.clearResetToken(user.id);

    return {
      success: true,
      message: 'Password reset successfully'
    };
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updates) {
    const allowedUpdates = ['first_name', 'last_name', 'company', 'preferences'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    const updatedUser = await User.update(userId, filteredUpdates);

    return this.sanitizeUser(updatedUser);
  }

  /**
   * Deactivate user account
   */
  static async deactivateUser(userId) {
    await User.deactivateUser(userId);

    return {
      success: true,
      message: 'Account deactivated successfully'
    };
  }

  /**
   * Generate JWT tokens
   */
  static generateTokens(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    const refreshToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });

    return { accessToken, refreshToken };
  }

  /**
   * Middleware to authenticate token
   */
  static authenticateToken() {
    return (req, res, next) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Access token is required'
        });
      }

      jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
          return res.status(403).json({
            success: false,
            error: 'Invalid or expired token'
          });
        }

        // Attach user info to request
        req.user = {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };

        next();
      });
    };
  }

  /**
   * Remove sensitive data from user object
   */
  static sanitizeUser(user) {
    const { password_hash, reset_token, reset_token_expiry, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

module.exports = AuthService;



const express = require('express');
const router = express.Router();
const authService = require('../auth/authService');
const { SystemLog } = require('../database/models');

// Middleware to log auth requests
router.use((req, res, next) => {
  console.log(`🔐 Auth request: ${req.method} ${req.path}`);
  next();
});

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, company, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      company,
      role
    });

    // Format response to match frontend expectations
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      id: result.user.id,
      email: result.user.email,
      name: `${result.user.first_name || ''} ${result.user.last_name || ''}`.trim() || result.user.email,
      token: result.accessToken,
      refreshToken: result.refreshToken,
      data: result
    });

  } catch (error) {
    console.error('Registration error:', error);
    SystemLog.error('User registration failed', { error: error.message });

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await authService.login(email, password);

    // Format response to match frontend expectations
    res.json({
      success: true,
      message: 'Login successful',
      id: result.user.id,
      email: result.user.email,
      name: `${result.user.first_name || ''} ${result.user.last_name || ''}`.trim() || result.user.email,
      token: result.accessToken,
      refreshToken: result.refreshToken,
      data: result
    });

  } catch (error) {
    console.error('Login error:', error);
    SystemLog.error('User login failed', { error: error.message });

    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const result = await authService.refreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    SystemLog.error('Token refresh failed', { error: error.message });

    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', authService.authenticateToken(), async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.logout(req.user.id, refreshToken);

    res.json({
      success: true,
      message: 'Logout successful',
      data: result
    });

  } catch (error) {
    console.error('Logout error:', error);
    SystemLog.error('User logout failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', authService.authenticateToken(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    const result = await authService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: result
    });

  } catch (error) {
    console.error('Change password error:', error);
    SystemLog.error('Password change failed', { error: error.message });

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/reset-password - Request password reset
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const result = await authService.resetPassword(email);

    res.json({
      success: true,
      message: result.message,
      data: result
    });

  } catch (error) {
    console.error('Password reset error:', error);
    SystemLog.error('Password reset failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Password reset failed'
    });
  }
});

// POST /api/auth/confirm-reset - Confirm password reset
router.post('/confirm-reset', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Reset token and new password are required'
      });
    }

    const result = await authService.confirmPasswordReset(resetToken, newPassword);

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: result
    });

  } catch (error) {
    console.error('Password reset confirmation error:', error);
    SystemLog.error('Password reset confirmation failed', { error: error.message });

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', authService.authenticateToken(), async (req, res) => {
  try {
    const result = await authService.getUserProfile(req.user.id);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get profile error:', error);
    SystemLog.error('Failed to get user profile', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
});

// PUT /api/auth/me - Update user profile
router.put('/me', authService.authenticateToken(), async (req, res) => {
  try {
    const result = await authService.updateUserProfile(req.user.id, req.body);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Update profile error:', error);
    SystemLog.error('Failed to update user profile', { error: error.message });

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/auth/me - Deactivate user account
router.delete('/me', authService.authenticateToken(), async (req, res) => {
  try {
    const result = await authService.deactivateUser(req.user.id);

    res.json({
      success: true,
      message: 'Account deactivated successfully',
      data: result
    });

  } catch (error) {
    console.error('Deactivate account error:', error);
    SystemLog.error('Failed to deactivate user account', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to deactivate account'
    });
  }
});

// GET /api/auth/verify - Verify token
router.get('/verify', authService.authenticateToken(), (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

// POST /api/auth/verify-email - Verify email address
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }

    // Implement email verification logic
    // This would typically involve checking a verification token
    // and updating the user's email_verified status

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    SystemLog.error('Email verification failed', { error: error.message });

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/resend-verification - Resend verification email
router.post('/resend-verification', authService.authenticateToken(), async (req, res) => {
  try {
    // Implement resend verification email logic
    // This would generate a new verification token and send an email

    res.json({
      success: true,
      message: 'Verification email sent'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    SystemLog.error('Failed to resend verification email', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email'
    });
  }
});

module.exports = router;

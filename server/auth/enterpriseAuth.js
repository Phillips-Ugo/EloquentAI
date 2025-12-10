const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const SamlStrategy = require('passport-saml').Strategy;
const OAuth2Strategy = require('passport-oauth2').Strategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { database } = require('../database/models');

class EnterpriseAuthService {
  constructor() {
    this.db = database;
    // HARDCODED FOR DEVELOPMENT
    this.jwtSecret = process.env.JWT_SECRET || 'hardcoded-enterprise-jwt-secret-key-for-development-123456789';
    this.jwtExpiry = process.env.JWT_EXPIRY || '24h';
    
    this.setupStrategies();
    this.setupPassport();
  }

  setupStrategies() {
    // JWT Strategy
    this.jwtStrategy = new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: this.jwtSecret
    }, async (payload, done) => {
      try {
        const user = await this.db.getUserById(payload.userId);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    });

    // Local Strategy
    this.localStrategy = new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    }, async (email, password, done) => {
      try {
        const user = await this.db.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid password' });
        }

        // Update last login
        await this.db.updateUser(user.id, { lastLogin: new Date().toISOString() });
        
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    });

    // SAML Strategy (for enterprise SSO)
    if (process.env.SAML_ENTRY_POINT && process.env.SAML_ISSUER) {
      this.samlStrategy = new SamlStrategy({
        entryPoint: process.env.SAML_ENTRY_POINT,
        issuer: process.env.SAML_ISSUER,
        cert: process.env.SAML_CERT,
        callbackUrl: process.env.SAML_CALLBACK_URL || '/auth/saml/callback',
        additionalParams: {},
        additionalAuthorizeParams: {},
        identifierFormat: null,
        acceptedClockSkewMs: 0,
        attributeConsumingServiceIndex: null,
        disableRequestedAuthnContext: false,
        authnContext: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/authenticationmethod/password',
        forceAuthn: false,
        skipRequestCompression: false,
        authnRequestBinding: 'HTTP-POST'
      }, async (profile, done) => {
        try {
          const user = await this.handleSamlUser(profile);
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      });
    }

    // OAuth2 Strategy (for Google, Microsoft, etc.)
    if (process.env.OAUTH2_CLIENT_ID && process.env.OAUTH2_CLIENT_SECRET) {
      this.oauth2Strategy = new OAuth2Strategy({
        authorizationURL: process.env.OAUTH2_AUTHORIZATION_URL,
        tokenURL: process.env.OAUTH2_TOKEN_URL,
        clientID: process.env.OAUTH2_CLIENT_ID,
        clientSecret: process.env.OAUTH2_CLIENT_SECRET,
        callbackURL: process.env.OAUTH2_CALLBACK_URL || '/auth/oauth2/callback',
        scope: process.env.OAUTH2_SCOPE || 'openid profile email'
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await this.handleOAuth2User(profile, accessToken, refreshToken);
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      });
    }
  }

  setupPassport() {
    passport.use('jwt', this.jwtStrategy);
    passport.use('local', this.localStrategy);
    
    if (this.samlStrategy) {
      passport.use('saml', this.samlStrategy);
    }
    
    if (this.oauth2Strategy) {
      passport.use('oauth2', this.oauth2Strategy);
    }

    passport.serializeUser((user, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
      try {
        const user = await this.db.getUserById(id);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
  }

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const { email, password, firstName, lastName, company, role = 'user' } = userData;
      
      // Check if user already exists
      const existingUser = await this.db.getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = {
        id: uuidv4(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        company,
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      };

      await this.db.createUser(user);
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      // Remove password from response
      delete user.password;
      
      return { user, token };
      
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const user = await this.db.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (user.status !== 'active') {
        throw new Error('Account is not active');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await this.db.updateUser(user.id, { lastLogin: new Date().toISOString() });
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      // Remove password from response
      delete user.password;
      
      return { user, token };
      
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Handle SAML user authentication
   */
  async handleSamlUser(profile) {
    try {
      const email = profile.email || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
      const firstName = profile.firstName || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'];
      const lastName = profile.lastName || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'];
      const company = profile.company || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/organization'];

      let user = await this.db.getUserByEmail(email);
      
      if (!user) {
        // Create new user from SAML profile
        user = {
          id: uuidv4(),
          email,
          firstName,
          lastName,
          company,
          role: 'user',
          status: 'active',
          authProvider: 'saml',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        };
        
        await this.db.createUser(user);
      } else {
        // Update existing user
        await this.db.updateUser(user.id, {
          lastLogin: new Date().toISOString(),
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          company: company || user.company
        });
      }

      return user;
      
    } catch (error) {
      throw new Error(`SAML authentication failed: ${error.message}`);
    }
  }

  /**
   * Handle OAuth2 user authentication
   */
  async handleOAuth2User(profile, accessToken, refreshToken) {
    try {
      const email = profile.emails?.[0]?.value || profile.email;
      const firstName = profile.name?.givenName || profile.firstName;
      const lastName = profile.name?.familyName || profile.lastName;
      const company = profile.organization || profile.company;

      let user = await this.db.getUserByEmail(email);
      
      if (!user) {
        // Create new user from OAuth2 profile
        user = {
          id: uuidv4(),
          email,
          firstName,
          lastName,
          company,
          role: 'user',
          status: 'active',
          authProvider: 'oauth2',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        };
        
        await this.db.createUser(user);
      } else {
        // Update existing user
        await this.db.updateUser(user.id, {
          lastLogin: new Date().toISOString(),
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          company: company || user.company
        });
      }

      return user;
      
    } catch (error) {
      throw new Error(`OAuth2 authentication failed: ${error.message}`);
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      company: user.company
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiry });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(oldToken) {
    try {
      const payload = this.verifyToken(oldToken);
      const user = await this.db.getUserById(payload.userId);
      
      if (!user || user.status !== 'active') {
        throw new Error('User not found or inactive');
      }

      return this.generateToken(user);
      
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    try {
      const allowedFields = ['firstName', 'lastName', 'company', 'preferences'];
      const updateData = {};
      
      for (const field of allowedFields) {
        if (profileData[field] !== undefined) {
          updateData[field] = profileData[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid fields to update');
      }

      await this.db.updateUser(userId, updateData);
      return await this.db.getUserById(userId);
      
    } catch (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.db.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.db.updateUser(userId, { password: hashedPassword });
      
      return { success: true, message: 'Password updated successfully' };
      
    } catch (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email) {
    try {
      const user = await this.db.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        return { success: true, message: 'If the email exists, a reset link has been sent' };
      }

      // Generate reset token
      const resetToken = uuidv4();
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

      await this.db.updateUser(user.id, {
        resetToken,
        resetExpiry: resetExpiry.toISOString()
      });

      // In a real implementation, send email here
      console.log(`Password reset token for ${email}: ${resetToken}`);
      
      return { success: true, message: 'If the email exists, a reset link has been sent' };
      
    } catch (error) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(token, newPassword) {
    try {
      const user = await this.db.getUserByResetToken(token);
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      if (new Date() > new Date(user.resetExpiry)) {
        throw new Error('Reset token has expired');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await this.db.updateUser(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetExpiry: null
      });

      return { success: true, message: 'Password reset successfully' };
      
    } catch (error) {
      throw new Error(`Password reset confirmation failed: ${error.message}`);
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId) {
    try {
      const user = await this.db.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const permissions = this.getRolePermissions(user.role);
      
      return {
        userId: user.id,
        role: user.role,
        permissions,
        company: user.company
      };
      
    } catch (error) {
      throw new Error(`Failed to get user permissions: ${error.message}`);
    }
  }

  /**
   * Get role-based permissions
   */
  getRolePermissions(role) {
    const rolePermissions = {
      admin: [
        'user:create', 'user:read', 'user:update', 'user:delete',
        'analysis:create', 'analysis:read', 'analysis:update', 'analysis:delete',
        'analytics:read', 'analytics:export',
        'system:admin', 'system:monitor'
      ],
      manager: [
        'user:create', 'user:read', 'user:update',
        'analysis:create', 'analysis:read', 'analysis:update',
        'analytics:read', 'analytics:export',
        'team:manage'
      ],
      user: [
        'analysis:create', 'analysis:read',
        'analytics:read'
      ],
      viewer: [
        'analysis:read',
        'analytics:read'
      ]
    };

    return rolePermissions[role] || rolePermissions.user;
  }

  /**
   * Middleware to check permissions
   */
  checkPermission(permission) {
    return async (req, res, next) => {
      try {
        const user = req.user;
        if (!user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const userPermissions = await this.getUserPermissions(user.id);
        if (!userPermissions.permissions.includes(permission)) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
  }

  /**
   * Middleware to check role
   */
  checkRole(roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient role permissions' });
      }

      next();
    };
  }
}

module.exports = new EnterpriseAuthService();

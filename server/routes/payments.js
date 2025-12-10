const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripeService');
const authService = require('../auth/authService');
const { SystemLog } = require('../database/models');

// Middleware to log payment requests
router.use((req, res, next) => {
  console.log(`💳 Payment request: ${req.method} ${req.path}`);
  next();
});

// GET /api/payments/plans - Get available pricing plans
router.get('/plans', async (req, res) => {
  try {
    const result = await stripeService.getPricingPlans();

    res.json({
      success: true,
      data: result.plans
    });

  } catch (error) {
    console.error('Get plans error:', error);
    SystemLog.error('Failed to get pricing plans', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to get pricing plans'
    });
  }
});

// POST /api/payments/create-checkout-session - Create checkout session
router.post('/create-checkout-session', authService.authenticateToken(), async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({
        success: false,
        error: 'Price ID is required'
      });
    }

    const result = await stripeService.createCheckoutSession(
      req.user.id,
      priceId,
      successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
      cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`
    );

    res.json({
      success: true,
      data: {
        sessionId: result.session.id,
        url: result.session.url
      }
    });

  } catch (error) {
    console.error('Create checkout session error:', error);
    SystemLog.error('Failed to create checkout session', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
});

// POST /api/payments/create-customer-portal - Create customer portal session
router.post('/create-customer-portal', authService.authenticateToken(), async (req, res) => {
  try {
    const { returnUrl } = req.body;

    // Get user's Stripe customer ID
    const user = await authService.getUserProfile(req.user.id);
    if (!user.data.user.stripe_customer_id) {
      return res.status(400).json({
        success: false,
        error: 'No Stripe customer found'
      });
    }

    const result = await stripeService.createBillingPortalSession(
      user.data.user.stripe_customer_id,
      returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/user-dashboard`
    );

    res.json({
      success: true,
      data: {
        url: result.session.url
      }
    });

  } catch (error) {
    console.error('Create customer portal error:', error);
    SystemLog.error('Failed to create customer portal session', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to create customer portal session'
    });
  }
});

// GET /api/payments/subscriptions - Get user's subscriptions
router.get('/subscriptions', authService.authenticateToken(), async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    if (!user.data.user.stripe_customer_id) {
      return res.json({
        success: true,
        data: {
          subscriptions: []
        }
      });
    }

    const result = await stripeService.getCustomerSubscriptions(user.data.user.stripe_customer_id);

    res.json({
      success: true,
      data: {
        subscriptions: result.subscriptions
      }
    });

  } catch (error) {
    console.error('Get subscriptions error:', error);
    SystemLog.error('Failed to get user subscriptions', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to get subscriptions'
    });
  }
});

// POST /api/payments/cancel-subscription - Cancel subscription
router.post('/cancel-subscription', authService.authenticateToken(), async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID is required'
      });
    }

    const result = await stripeService.cancelSubscription(subscriptionId, req.user.id);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: result.subscription
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    SystemLog.error('Failed to cancel subscription', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

// POST /api/payments/update-subscription - Update subscription
router.post('/update-subscription', authService.authenticateToken(), async (req, res) => {
  try {
    const { subscriptionId, newPriceId } = req.body;

    if (!subscriptionId || !newPriceId) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID and new price ID are required'
      });
    }

    const result = await stripeService.updateSubscription(subscriptionId, newPriceId);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: result.subscription
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    SystemLog.error('Failed to update subscription', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to update subscription'
    });
  }
});

// POST /api/payments/webhook - Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing Stripe signature'
      });
    }

    const result = await stripeService.handleWebhook(req.body, signature);

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    SystemLog.error('Failed to process webhook', { error: error.message });

    res.status(400).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

// GET /api/payments/status - Get payment status for user
router.get('/status', authService.authenticateToken(), async (req, res) => {
  try {
    const user = await authService.getUserProfile(req.user.id);
    const userData = user.data.user;

    res.json({
      success: true,
      data: {
        hasActiveSubscription: userData.subscription_status === 'active',
        subscriptionStatus: userData.subscription_status,
        stripeCustomerId: userData.stripe_customer_id,
        stripeSubscriptionId: userData.stripe_subscription_id
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    SystemLog.error('Failed to get payment status', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to get payment status'
    });
  }
});

// POST /api/payments/create-payment-intent - Create payment intent for one-time payments
router.post('/create-payment-intent', authService.authenticateToken(), async (req, res) => {
  try {
    const { amount, currency = 'usd', description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    const user = await authService.getUserProfile(req.user.id);
    const customerId = user.data.user.stripe_customer_id;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'No Stripe customer found. Please create a subscription first.'
      });
    }

    const result = await stripeService.createPaymentIntent(
      amount,
      currency,
      customerId,
      {
        user_id: req.user.id,
        description: description || 'One-time payment'
      }
    );

    res.json({
      success: true,
      data: {
        clientSecret: result.paymentIntent.client_secret,
        paymentIntentId: result.paymentIntent.id
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    SystemLog.error('Failed to create payment intent', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

module.exports = router;

const stripe = require('stripe');
const { SystemLog, User } = require('../database/models');

class StripeService {
  constructor() {
    this.stripe = null;
    // HARDCODED API KEYS (for development)
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy_webhook_secret_123456789';
    this.isConfigured = false;
    this.initialize();
  }

  async initialize() {
    try {
      // HARDCODED STRIPE KEYS (for development)
      const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_secret_key_123456789012345678901234567890';
      const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy_publishable_key_123456789012345678901234567890';
      
      if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'sk_test_your_secret_key_here' && STRIPE_SECRET_KEY !== 'sk_test_dummy_secret_key_123456789012345678901234567890') {
        this.stripe = stripe(STRIPE_SECRET_KEY);
        this.isConfigured = true;
        SystemLog.info('Stripe service initialized', {
          publishable_key: STRIPE_PUBLISHABLE_KEY ? 'configured' : 'missing',
          secret_key: 'configured'
        });
      } else {
        SystemLog.warn('Stripe service not configured - payment features will be disabled', {
          reason: 'STRIPE_SECRET_KEY not set or using placeholder value'
        });
      }
    } catch (error) {
      SystemLog.error('Failed to initialize Stripe service', { error: error.message });
      this.isConfigured = false;
    }
  }

  // Check if Stripe is configured
  _checkStripeConfigured() {
    if (!this.isConfigured || !this.stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
  }

  // Create a new customer
  async createCustomer(userData) {
    try {
      this._checkStripeConfigured();
      const customer = await this.stripe.customers.create({
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        metadata: {
          user_id: userData.id,
          company: userData.company || ''
        }
      });

      SystemLog.info('Stripe customer created', {
        customer_id: customer.id,
        user_id: userData.id,
        email: userData.email
      });

      return {
        success: true,
        customer: customer
      };

    } catch (error) {
      SystemLog.error('Failed to create Stripe customer', { error: error.message });
      throw error;
    }
  }

  // Create a subscription
  async createSubscription(customerId, priceId, userId) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          user_id: userId
        }
      });

      SystemLog.info('Stripe subscription created', {
        subscription_id: subscription.id,
        customer_id: customerId,
        user_id: userId
      });

      return {
        success: true,
        subscription: subscription
      };

    } catch (error) {
      SystemLog.error('Failed to create Stripe subscription', { error: error.message });
      throw error;
    }
  }

  // Create a checkout session
  async createCheckoutSession(userId, priceId, successUrl, cancelUrl) {
    try {
      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create or get customer
      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customerResult = await this.createCustomer(user);
        customerId = customerResult.customer.id;
        
        // Update user with customer ID
        await User.update(userId, { stripe_customer_id: customerId });
      }

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId
        },
        subscription_data: {
          metadata: {
            user_id: userId
          }
        }
      });

      SystemLog.info('Stripe checkout session created', {
        session_id: session.id,
        user_id: userId,
        price_id: priceId
      });

      return {
        success: true,
        session: session
      };

    } catch (error) {
      SystemLog.error('Failed to create checkout session', { error: error.message });
      throw error;
    }
  }

  // Create a payment intent
  async createPaymentIntent(amount, currency, customerId, metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: currency,
        customer: customerId,
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      SystemLog.info('Stripe payment intent created', {
        payment_intent_id: paymentIntent.id,
        amount: amount,
        currency: currency
      });

      return {
        success: true,
        paymentIntent: paymentIntent
      };

    } catch (error) {
      SystemLog.error('Failed to create payment intent', { error: error.message });
      throw error;
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      return {
        success: true,
        subscription: subscription
      };

    } catch (error) {
      SystemLog.error('Failed to get subscription', { error: error.message });
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, userId) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      SystemLog.info('Stripe subscription cancelled', {
        subscription_id: subscriptionId,
        user_id: userId
      });

      return {
        success: true,
        subscription: subscription
      };

    } catch (error) {
      SystemLog.error('Failed to cancel subscription', { error: error.message });
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations'
      });

      SystemLog.info('Stripe subscription updated', {
        subscription_id: subscriptionId,
        new_price_id: newPriceId
      });

      return {
        success: true,
        subscription: updatedSubscription
      };

    } catch (error) {
      SystemLog.error('Failed to update subscription', { error: error.message });
      throw error;
    }
  }

  // Create billing portal session
  async createBillingPortalSession(customerId, returnUrl) {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      SystemLog.info('Stripe billing portal session created', {
        session_id: session.id,
        customer_id: customerId
      });

      return {
        success: true,
        session: session
      };

    } catch (error) {
      SystemLog.error('Failed to create billing portal session', { error: error.message });
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      SystemLog.info('Stripe webhook received', {
        event_type: event.type,
        event_id: event.id
      });

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object);
          break;
        
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;
        
        default:
          SystemLog.info('Unhandled Stripe webhook event', { event_type: event.type });
      }

      return {
        success: true,
        event: event
      };

    } catch (error) {
      SystemLog.error('Failed to handle Stripe webhook', { error: error.message });
      throw error;
    }
  }

  // Webhook event handlers
  async handleCheckoutSessionCompleted(session) {
    try {
      const userId = session.metadata.user_id;
      if (userId) {
        await User.update(userId, {
          subscription_status: 'active',
          stripe_customer_id: session.customer
        });
        
        SystemLog.info('User subscription activated', {
          user_id: userId,
          session_id: session.id
        });
      }
    } catch (error) {
      SystemLog.error('Failed to handle checkout session completed', { error: error.message });
    }
  }

  async handleSubscriptionCreated(subscription) {
    try {
      const userId = subscription.metadata.user_id;
      if (userId) {
        await User.update(userId, {
          subscription_status: 'active',
          stripe_subscription_id: subscription.id
        });
        
        SystemLog.info('User subscription created', {
          user_id: userId,
          subscription_id: subscription.id
        });
      }
    } catch (error) {
      SystemLog.error('Failed to handle subscription created', { error: error.message });
    }
  }

  async handleSubscriptionUpdated(subscription) {
    try {
      const userId = subscription.metadata.user_id;
      if (userId) {
        const status = subscription.status === 'active' ? 'active' : 'inactive';
        await User.update(userId, {
          subscription_status: status
        });
        
        SystemLog.info('User subscription updated', {
          user_id: userId,
          subscription_id: subscription.id,
          status: status
        });
      }
    } catch (error) {
      SystemLog.error('Failed to handle subscription updated', { error: error.message });
    }
  }

  async handleSubscriptionDeleted(subscription) {
    try {
      const userId = subscription.metadata.user_id;
      if (userId) {
        await User.update(userId, {
          subscription_status: 'cancelled',
          stripe_subscription_id: null
        });
        
        SystemLog.info('User subscription deleted', {
          user_id: userId,
          subscription_id: subscription.id
        });
      }
    } catch (error) {
      SystemLog.error('Failed to handle subscription deleted', { error: error.message });
    }
  }

  async handleInvoicePaymentSucceeded(invoice) {
    try {
      SystemLog.info('Invoice payment succeeded', {
        invoice_id: invoice.id,
        customer_id: invoice.customer
      });
    } catch (error) {
      SystemLog.error('Failed to handle invoice payment succeeded', { error: error.message });
    }
  }

  async handleInvoicePaymentFailed(invoice) {
    try {
      SystemLog.info('Invoice payment failed', {
        invoice_id: invoice.id,
        customer_id: invoice.customer
      });
    } catch (error) {
      SystemLog.error('Failed to handle invoice payment failed', { error: error.message });
    }
  }

  // Get pricing plans
  async getPricingPlans() {
    try {
      const prices = await this.stripe.prices.list({
        active: true,
        expand: ['data.product']
      });

      const plans = prices.data.map(price => ({
        id: price.id,
        product_id: price.product.id,
        product_name: price.product.name,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        interval_count: price.recurring?.interval_count,
        description: price.product.description,
        features: price.product.metadata?.features?.split(',') || []
      }));

      return {
        success: true,
        plans: plans
      };

    } catch (error) {
      SystemLog.error('Failed to get pricing plans', { error: error.message });
      throw error;
    }
  }

  // Get customer's subscriptions
  async getCustomerSubscriptions(customerId) {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        status: 'all'
      });

      return {
        success: true,
        subscriptions: subscriptions.data
      };

    } catch (error) {
      SystemLog.error('Failed to get customer subscriptions', { error: error.message });
      throw error;
    }
  }
}

// Create singleton instance
const stripeService = new StripeService();

module.exports = stripeService;

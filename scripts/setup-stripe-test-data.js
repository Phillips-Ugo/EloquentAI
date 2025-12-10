#!/usr/bin/env node

/**
 * Stripe Test Data Setup Script
 * Creates test products and pricing plans for Eloquent AI
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key_here');

async function setupStripeTestData() {
  console.log('🚀 Setting up Stripe test data...\n');

  try {
    // Check if we have a valid Stripe key
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_secret_key_here')) {
      console.log('❌ Please set your STRIPE_SECRET_KEY in the environment variables');
      console.log('   You can get test keys from: https://dashboard.stripe.com/test/apikeys\n');
      return;
    }

    // Test the connection
    await stripe.products.list({ limit: 1 });
    console.log('✅ Connected to Stripe successfully\n');

    // Create test products and pricing plans
    const plans = [
      {
        name: 'Starter Plan',
        description: 'Perfect for individuals getting started with AI communication analysis',
        features: [
          '5 analyses per month',
          'Basic AI insights',
          'Email support',
          'Standard accuracy'
        ],
        price: 9.99,
        interval: 'month',
        metadata: {
          analyses_limit: '5',
          support_level: 'email',
          accuracy_level: 'standard'
        }
      },
      {
        name: 'Professional Plan',
        description: 'Advanced features for professionals and small teams',
        features: [
          'Unlimited analyses',
          'Advanced AI insights',
          'Priority support',
          'High accuracy analysis',
          'Export reports',
          'Team collaboration'
        ],
        price: 29.99,
        interval: 'month',
        metadata: {
          analyses_limit: 'unlimited',
          support_level: 'priority',
          accuracy_level: 'high'
        }
      },
      {
        name: 'Enterprise Plan',
        description: 'Full-featured solution for large organizations',
        features: [
          'Unlimited analyses',
          'Premium AI insights',
          '24/7 dedicated support',
          'Maximum accuracy',
          'Custom integrations',
          'Advanced analytics',
          'White-label options',
          'SLA guarantee'
        ],
        price: 99.99,
        interval: 'month',
        metadata: {
          analyses_limit: 'unlimited',
          support_level: 'dedicated',
          accuracy_level: 'maximum'
        }
      }
    ];

    console.log('📦 Creating products and pricing plans...\n');

    for (const plan of plans) {
      try {
        // Create product
        const product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: plan.metadata
        });

        console.log(`✅ Created product: ${product.name} (${product.id})`);

        // Create price
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(plan.price * 100), // Convert to cents
          currency: 'usd',
          recurring: {
            interval: plan.interval
          },
          metadata: plan.metadata
        });

        console.log(`   💰 Created price: $${plan.price}/${plan.interval} (${price.id})`);

        // Display features
        console.log(`   📋 Features:`);
        plan.features.forEach(feature => {
          console.log(`      • ${feature}`);
        });

        console.log('');

      } catch (error) {
        console.log(`❌ Error creating ${plan.name}:`, error.message);
      }
    }

    // Create a one-time payment product for credits
    try {
      const creditsProduct = await stripe.products.create({
        name: 'Analysis Credits',
        description: 'One-time purchase of analysis credits for pay-per-use',
        metadata: {
          type: 'credits',
          analyses_per_credit: '1'
        }
      });

      const creditsPrice = await stripe.prices.create({
        product: creditsProduct.id,
        unit_amount: 299, // $2.99 per credit
        currency: 'usd',
        metadata: {
          type: 'credits',
          analyses_per_credit: '1'
        }
      });

      console.log(`✅ Created credits product: ${creditsProduct.name} (${creditsProduct.id})`);
      console.log(`   💰 Created price: $2.99 per credit (${creditsPrice.id})\n`);

    } catch (error) {
      console.log(`❌ Error creating credits product:`, error.message);
    }

    // List all products to verify
    console.log('📋 Current products in your Stripe account:');
    const products = await stripe.products.list({ active: true });
    
    for (const product of products.data) {
      const prices = await stripe.prices.list({ product: product.id, active: true });
      console.log(`\n🏷️  ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Description: ${product.description}`);
      
      for (const price of prices.data) {
        const amount = (price.unit_amount / 100).toFixed(2);
        const interval = price.recurring ? `/${price.recurring.interval}` : ' (one-time)';
        console.log(`   💰 Price: $${amount}${interval} (${price.id})`);
      }
    }

    console.log('\n🎉 Stripe test data setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Copy the price IDs above to your environment variables');
    console.log('2. Update your frontend to use these price IDs');
    console.log('3. Test the payment flow with Stripe test cards');
    console.log('\n💳 Test card numbers:');
    console.log('   • Success: 4242 4242 4242 4242');
    console.log('   • Decline: 4000 0000 0000 0002');
    console.log('   • 3D Secure: 4000 0025 0000 3155');

  } catch (error) {
    console.error('❌ Error setting up Stripe test data:', error.message);
    
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n🔑 Authentication Error:');
      console.log('   Please check your STRIPE_SECRET_KEY');
      console.log('   Get your test keys from: https://dashboard.stripe.com/test/apikeys');
    }
  }
}

// Run the setup
if (require.main === module) {
  setupStripeTestData();
}

module.exports = setupStripeTestData;

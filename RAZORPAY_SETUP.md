# Razorpay Subscription Setup Guide

This guide will help you set up Razorpay payment integration for your SchedulePro application.

## 🚀 Quick Start

### 1. Create a Razorpay Account

1. Go to https://razorpay.com and sign up
2. Complete KYC verification (required for live mode)
3. Navigate to Settings → API Keys

### 2. Get API Credentials

**Test Mode:**
- Click on "Generate Test Key" in the dashboard
- Copy your `Key ID` and `Key Secret`

**Live Mode (Production):**
- Complete KYC verification
- Click on "Generate Live Key"
- Copy your `Key ID` and `Key Secret`

### 3. Add Environment Variables

Add these to your `.env` file:

```env
# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

# Razorpay Plan IDs (you'll create these in step 4)
RAZORPAY_PLAN_PRO_MONTHLY=plan_xxx
RAZORPAY_PLAN_PRO_YEARLY=plan_xxx
RAZORPAY_PLAN_BUSINESS_MONTHLY=plan_xxx
RAZORPAY_PLAN_BUSINESS_YEARLY=plan_xxx
```

## 📦 Create Subscription Plans

### 4. Create Plans in Razorpay Dashboard

Go to **Subscriptions → Plans** in your Razorpay dashboard and create the following plans:

#### Pro Monthly Plan
- **Plan Name:** Pro Monthly
- **Billing Cycle:** 1 month
- **Amount:** ₹999
- **Currency:** INR
- **Description:** SchedulePro Pro Plan - Monthly
- Copy the `plan_id` and add to `.env` as `RAZORPAY_PLAN_PRO_MONTHLY`

#### Pro Yearly Plan
- **Plan Name:** Pro Yearly
- **Billing Cycle:** 1 year
- **Amount:** ₹9,999
- **Currency:** INR
- **Description:** SchedulePro Pro Plan - Yearly (Save 17%)
- Copy the `plan_id` and add to `.env` as `RAZORPAY_PLAN_PRO_YEARLY`

#### Business Monthly Plan
- **Plan Name:** Business Monthly
- **Billing Cycle:** 1 month
- **Amount:** ₹2,499
- **Currency:** INR
- **Description:** SchedulePro Business Plan - Monthly
- Copy the `plan_id` and add to `.env` as `RAZORPAY_PLAN_BUSINESS_MONTHLY`

#### Business Yearly Plan
- **Plan Name:** Business Yearly
- **Billing Cycle:** 1 year
- **Amount:** ₹24,999
- **Currency:** INR
- **Description:** SchedulePro Business Plan - Yearly (Save 17%)
- Copy the `plan_id` and add to `.env` as `RAZORPAY_PLAN_BUSINESS_YEARLY`

## 🔔 Setup Webhooks

### 5. Configure Webhook Endpoint

1. Go to **Settings → Webhooks** in Razorpay dashboard
2. Click "Add New Webhook"
3. **Webhook URL:** `https://yourdomain.com/api/subscription/webhook`
4. **Secret:** Generate a random string (e.g., `openssl rand -hex 32`)
5. Add the secret to `.env` as `RAZORPAY_WEBHOOK_SECRET`

### 6. Select Webhook Events

Enable these events:
- ✅ `subscription.activated`
- ✅ `subscription.charged`
- ✅ `subscription.completed`
- ✅ `subscription.cancelled`
- ✅ `subscription.pending`
- ✅ `subscription.halted`
- ✅ `subscription.paused`
- ✅ `subscription.resumed`

Click "Save" to activate the webhook.

## 🧪 Testing

### Test Mode Setup

1. Use test API keys (starting with `rzp_test_`)
2. Create test plans with small amounts (₹1, ₹10, etc.)
3. Use Razorpay test cards for payment:
   - **Success:** 4111 1111 1111 1111
   - **Failure:** 4000 0000 0000 0002
   - **CVV:** Any 3 digits
   - **Expiry:** Any future date

### Test the Flow

1. Visit `/pricing` page
2. Click on a paid plan (Pro or Business)
3. Complete the Razorpay checkout
4. Verify:
   - Subscription is created in Razorpay dashboard
   - User's subscription tier is updated in database
   - Webhook events are received
   - Usage limits are enforced

### Test Webhook Locally

Use ngrok to test webhooks locally:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Copy the ngrok URL and update Razorpay webhook URL
# https://xxxx-xx-xx-xx-xx.ngrok.io/api/subscription/webhook
```

## 🎯 Pricing Tiers

### Free Tier
- **Price:** ₹0
- **Event Types:** 1
- **Bookings:** 10/month
- **Features:** Basic email notifications

### Pro Tier
- **Monthly:** ₹999/month
- **Yearly:** ₹9,999/year (Save 17%)
- **Event Types:** Unlimited
- **Bookings:** Unlimited
- **Features:** 
  - Google Calendar integration
  - Custom branding
  - Email & SMS reminders
  - Priority support

### Business Tier
- **Monthly:** ₹2,499/month
- **Yearly:** ₹24,999/year (Save 17%)
- **Event Types:** Unlimited
- **Bookings:** Unlimited
- **Team Members:** Up to 5
- **Features:**
  - Everything in Pro
  - Team scheduling
  - Advanced analytics
  - Custom domain
  - API access
  - Zapier integration

## 🔧 Usage Limits Enforcement

Usage limits are automatically enforced:

1. **Event Types:** Checked when creating a new event type
   - Free: 1 event type maximum
   - Pro/Business: Unlimited

2. **Bookings:** Checked when creating a new booking
   - Free: 10 bookings per month
   - Pro/Business: Unlimited

When a limit is reached, users receive an error message with upgrade instructions.

## 📊 Monitoring

### Check Subscription Status

```sql
-- View all active subscriptions
SELECT 
  u.email, 
  u.subscription_tier, 
  u.subscription_status,
  u.current_period_end
FROM users u
WHERE u.subscription_tier != 'free';

-- Check usage metrics
SELECT 
  u.email,
  COUNT(DISTINCT et.id) as event_types,
  COUNT(DISTINCT b.id) as bookings
FROM users u
LEFT JOIN event_types et ON et.user_id = u.id
LEFT JOIN bookings b ON b.user_id = u.id 
  AND b.created_at >= date_trunc('month', CURRENT_DATE)
GROUP BY u.id, u.email;
```

### View Subscription History

```sql
SELECT 
  u.email,
  sh.action,
  sh.from_tier,
  sh.to_tier,
  sh.amount,
  sh.created_at
FROM subscription_history sh
JOIN users u ON u.id = sh.user_id
ORDER BY sh.created_at DESC
LIMIT 20;
```

## 🚀 Going Live

### Production Checklist

- [ ] Complete KYC verification in Razorpay
- [ ] Generate live API keys
- [ ] Create live subscription plans
- [ ] Update environment variables with live credentials
- [ ] Configure live webhook with production URL
- [ ] Test complete payment flow in live mode
- [ ] Set up proper error monitoring (Sentry, LogRocket, etc.)
- [ ] Enable email notifications for failed payments
- [ ] Set up billing alerts in Razorpay

### Security Best Practices

1. **Never expose API secrets:**
   - Keep `RAZORPAY_KEY_SECRET` server-side only
   - Only use `RAZORPAY_KEY_ID` in frontend

2. **Verify webhook signatures:**
   - Always verify the webhook signature before processing
   - Already implemented in `/api/subscription/webhook/route.ts`

3. **Handle failures gracefully:**
   - Log all payment failures
   - Send notifications to admins
   - Provide clear error messages to users

4. **Monitor subscription status:**
   - Check for `halted` subscriptions (payment failed)
   - Send reminders to update payment methods
   - Grace period before downgrading to free tier

## 🆘 Troubleshooting

### Common Issues

**1. Webhook not receiving events**
- Verify webhook URL is publicly accessible
- Check webhook signature matches `.env` value
- Look at webhook logs in Razorpay dashboard
- Ensure all required events are selected

**2. Payment failing**
- Check if using test/live keys correctly
- Verify plan IDs in `.env` match Razorpay dashboard
- Check Razorpay dashboard for error details
- Ensure customer has sufficient balance (test mode)

**3. Subscription not activating**
- Check database for subscription status
- Verify webhook received `subscription.activated` event
- Check application logs for errors
- Manually trigger webhook from Razorpay dashboard

**4. Usage limits not working**
- Verify user's `subscription_tier` in database
- Check `checkUsageLimit` function in `/lib/subscription.ts`
- Look at API error responses for limit checks

## 📚 Additional Resources

- [Razorpay Subscriptions Docs](https://razorpay.com/docs/subscriptions/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Webhook Guide](https://razorpay.com/docs/webhooks/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)

## 💡 Tips

1. **Start with test mode:** Always test thoroughly in test mode before going live
2. **Monitor webhooks:** Set up logging to track all webhook events
3. **Handle edge cases:** Plan for failed payments, expired cards, etc.
4. **User communication:** Send clear emails about subscription changes
5. **Provide value:** Make sure premium features justify the pricing

## 🎉 You're All Set!

Your Razorpay subscription system is now ready. Test it thoroughly and monitor the logs for any issues.

Need help? Check the Razorpay documentation or reach out to their support team.

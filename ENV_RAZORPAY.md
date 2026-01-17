## Razorpay Environment Variables

Add these variables to your `.env` file:

```env
# ==============================================
# RAZORPAY CONFIGURATION
# ==============================================

# Get your API keys from: https://dashboard.razorpay.com/app/keys
# Use test keys (rzp_test_xxx) for development
# Use live keys (rzp_live_xxx) for production
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY_HERE

# Webhook secret for verifying webhook requests
# Generate a random string: openssl rand -hex 32
# Configure at: https://dashboard.razorpay.com/app/webhooks
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE

# ==============================================
# RAZORPAY SUBSCRIPTION PLANS
# ==============================================

# Create these plans at: https://dashboard.razorpay.com/app/subscriptions/plans
# After creating each plan, copy the plan_id here

# Pro Plan - Monthly (₹999/month)
RAZORPAY_PLAN_PRO_MONTHLY=plan_YOUR_PLAN_ID_HERE

# Pro Plan - Yearly (₹9999/year - Save 17%)
RAZORPAY_PLAN_PRO_YEARLY=plan_YOUR_PLAN_ID_HERE

# Business Plan - Monthly (₹2499/month)
RAZORPAY_PLAN_BUSINESS_MONTHLY=plan_YOUR_PLAN_ID_HERE

# Business Plan - Yearly (₹24999/year - Save 17%)
RAZORPAY_PLAN_BUSINESS_YEARLY=plan_YOUR_PLAN_ID_HERE
```

## Complete .env File Structure

Your complete `.env` file should now look like this:

```env
# ==============================================
# DATABASE
# ==============================================
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/scheduling_mvp?schema=public"

# ==============================================
# NEXTAUTH
# ==============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# ==============================================
# GOOGLE CALENDAR OAUTH (Optional)
# ==============================================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ==============================================
# EMAIL CONFIGURATION
# ==============================================
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"

# ==============================================
# APP CONFIG
# ==============================================
APP_URL="http://localhost:3000"
APP_NAME="SchedulePro"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ==============================================
# RAZORPAY CONFIGURATION
# ==============================================
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY_HERE
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE

# ==============================================
# RAZORPAY SUBSCRIPTION PLANS
# ==============================================
RAZORPAY_PLAN_PRO_MONTHLY=plan_YOUR_PLAN_ID_HERE
RAZORPAY_PLAN_PRO_YEARLY=plan_YOUR_PLAN_ID_HERE
RAZORPAY_PLAN_BUSINESS_MONTHLY=plan_YOUR_PLAN_ID_HERE
RAZORPAY_PLAN_BUSINESS_YEARLY=plan_YOUR_PLAN_ID_HERE
```

## How to Get These Values

### 1. RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET
1. Go to https://dashboard.razorpay.com/app/keys
2. Click "Generate Test Key" (for development)
3. Copy both Key ID and Key Secret

### 2. RAZORPAY_WEBHOOK_SECRET
1. Generate: `openssl rand -hex 32`
2. Go to https://dashboard.razorpay.com/app/webhooks
3. Click "Add New Webhook"
4. Enter URL: `https://yourdomain.com/api/subscription/webhook`
5. Use the generated secret
6. Select all subscription events

### 3. RAZORPAY_PLAN_* IDs
1. Go to https://dashboard.razorpay.com/app/subscriptions/plans
2. Create 4 plans:
   - Pro Monthly (₹999)
   - Pro Yearly (₹9999)
   - Business Monthly (₹2499)
   - Business Yearly (₹24999)
3. Copy each plan_id after creation

## Testing Values

For testing, use these Razorpay test credentials:
- Test Key ID: Starts with `rzp_test_`
- Test Secret: From Razorpay dashboard
- Test webhook secret: Any random string
- Test plan IDs: Create test plans with small amounts (₹1, ₹10, etc.)

## Production Values

For production:
1. Complete KYC verification in Razorpay
2. Generate live keys (start with `rzp_live_`)
3. Create live plans with actual prices
4. Update all environment variables
5. Never commit live credentials to version control!

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to git
- Never expose `RAZORPAY_KEY_SECRET` to frontend
- Only `RAZORPAY_KEY_ID` can be public (used in Razorpay checkout)
- Always verify webhook signatures
- Use different credentials for development and production

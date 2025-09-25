# 🔥 Stripe Integration Setup Guide

## Step 1: Get Your Stripe API Keys

1. **Go to your Stripe Dashboard**: https://dashboard.stripe.com/
2. **Click "Developers" → "API keys"**
3. **Copy these keys:**
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

## Step 2: Create Your Products & Prices

### In Stripe Dashboard:
1. **Go to "Products" → "Create product"**
2. **Create these 3 products exactly:**

### Product 1: VervidFlow Basic
- **Name**: `VervidFlow Basic`
- **Description**: `Up to 3 technicians with essential CRM features`
- **Pricing Model**: `Recurring`
- **Price**: `$29.00 USD`
- **Billing Period**: `Monthly`
- **Copy the Price ID** (starts with `price_...`)

### Product 2: VervidFlow Professional
- **Name**: `VervidFlow Professional`
- **Description**: `Up to 10 technicians with advanced features and integrations`
- **Pricing Model**: `Recurring`
- **Price**: `$79.00 USD`
- **Billing Period**: `Monthly`
- **Copy the Price ID**

### Product 3: VervidFlow Enterprise
- **Name**: `VervidFlow Enterprise`
- **Description**: `Unlimited technicians with white-label and priority support`
- **Pricing Model**: `Recurring`
- **Price**: `$149.00 USD`
- **Billing Period**: `Monthly`
- **Copy the Price ID**

## Step 3: Update Your Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY_HERE"
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET_HERE"

# Stripe Price IDs (from your products)
STRIPE_BASIC_PRICE_ID="price_YOUR_BASIC_PRICE_ID"
STRIPE_PRO_PRICE_ID="price_YOUR_PRO_PRICE_ID"
STRIPE_ENTERPRISE_PRICE_ID="price_YOUR_ENTERPRISE_PRICE_ID"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="YOUR_32_CHAR_SECRET_HERE"

# Database (set up later)
DATABASE_URL="postgresql://username:password@host:5432/database"
```

## Step 4: Set Up Webhook (for production)

1. **In Stripe Dashboard**: Go to "Developers" → "Webhooks"
2. **Click "Add endpoint"**
3. **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
4. **Select events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Copy the Webhook Secret** (starts with `whsec_...`)

## Step 5: Test Your Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Visit the pricing page**:
   ```
   http://localhost:3000/pricing-new
   ```

3. **Test the subscription flow**:
   - Click "Get Started" on any plan
   - You'll be redirected to Stripe's test payment form
   - Use test card: `4242 4242 4242 4242`
   - Any future date for expiry
   - Any 3-digit CVC

## Step 6: Verify Integration

After a successful test payment, check:

1. **Stripe Dashboard**: You should see a new customer and subscription
2. **Your database**: The organization should be updated with Stripe IDs
3. **User experience**: They should be redirected back to your app

## Troubleshooting

### Common Issues:

1. **"Invalid API Key"**
   - Make sure you're using the correct test keys
   - Check for extra spaces or quotes

2. **"Price not found"**
   - Verify your Price IDs are correct
   - Make sure products are active in Stripe

3. **Webhook errors**
   - For development, webhooks aren't required
   - Use Stripe CLI for local webhook testing

### Test Cards:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

## Next Steps After Setup:

1. **Set up database** (Railway, Supabase, etc.)
2. **Run database migrations**
3. **Deploy to production**
4. **Set up production webhooks**
5. **Switch to live Stripe keys**

## Revenue Tracking:

Once set up, you can track:
- **MRR (Monthly Recurring Revenue)**
- **Customer churn rate**
- **Plan upgrade/downgrade patterns**
- **Trial-to-paid conversion**

Your Stripe integration is now ready for business! 🚀

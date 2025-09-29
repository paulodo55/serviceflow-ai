# 🗄️ Database Setup Guide - ServiceFlow

## 🚨 **Current Issue**
Your `DATABASE_URL` is set to a placeholder. You need a real PostgreSQL database to run the signup functionality.

## 🎯 **Quick Solution Options**

### **Option 1: Railway (Recommended - $5/month)**
1. **Sign up**: Go to [railway.app](https://railway.app)
2. **Create PostgreSQL database**:
   - Click "New Project"
   - Select "PostgreSQL"
   - Wait for deployment (2-3 minutes)
3. **Get connection URL**:
   - Click on PostgreSQL service
   - Go to "Variables" tab
   - Copy `DATABASE_URL`
4. **Update your .env.local**:
   ```
   DATABASE_URL="postgresql://postgres:password@host.railway.app:5432/railway"
   ```

### **Option 2: Supabase (Free tier available)**
1. **Sign up**: Go to [supabase.com](https://supabase.com)
2. **Create new project**
3. **Get connection URL**:
   - Go to Settings → Database
   - Copy "Connection string" (URI format)
4. **Update your .env.local**

### **Option 3: Local PostgreSQL (Free, but complex)**
1. **Install PostgreSQL**:
   ```bash
   # macOS with Homebrew
   brew install postgresql
   brew services start postgresql
   
   # Create database
   createdb serviceflow
   ```
2. **Update .env.local**:
   ```
   DATABASE_URL="postgresql://localhost:5432/serviceflow"
   ```

### **Option 4: Neon (Free tier)**
1. **Sign up**: Go to [neon.tech](https://neon.tech)
2. **Create database**
3. **Copy connection string**

## 🛠️ **After Getting Your Database URL**

### **Step 1: Update Environment**
Replace the placeholder in `.env.local`:
```bash
# Replace this placeholder:
DATABASE_URL="your-database-url-here"

# With your actual database URL:
DATABASE_URL="postgresql://username:password@host:5432/database"
```

### **Step 2: Setup Database Schema**
```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init-production

# (Optional) View database
npx prisma studio
```

### **Step 3: Test Connection**
```bash
# Test database connection
npx prisma db push
```

## 🚀 **Recommended: Railway Setup (5 minutes)**

Railway is the easiest option:

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" → "PostgreSQL"**
4. **Wait 2-3 minutes for deployment**
5. **Click PostgreSQL service → Variables tab**
6. **Copy the `DATABASE_URL`**
7. **Paste it in your `.env.local` file**

## 💰 **Cost Comparison**
- **Railway**: $5/month (8GB storage, backups)
- **Supabase**: Free tier (500MB), then $25/month
- **Neon**: Free tier (3GB), then $19/month
- **Local**: Free but requires maintenance

## ⚡ **Quick Test Script**

After setting up your database, test it:

```bash
# Test database connection
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => console.log('✅ Database connected successfully!'))
  .catch(err => console.error('❌ Database connection failed:', err.message))
  .finally(() => prisma.\$disconnect());
"
```

## 🔧 **Environment Variables Needed**

Make sure your `.env.local` has:
```env
# Database (REQUIRED)
DATABASE_URL="postgresql://username:password@host:5432/database"

# NextAuth (REQUIRED)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-key"

# Email (for contact forms)
SENDGRID_API_KEY="SG.your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="hello@vervidflow.com"
SENDGRID_FROM_NAME="VervidFlow"
```

## 🎯 **Next Steps After Database Setup**

1. **Test signup functionality** at `/signup`
2. **Test contact form** at `/contact`  
3. **Deploy to production** with database URL in Vercel
4. **Set up Stripe** for payments (optional)

Your signup page will work once you have a real PostgreSQL database connected! 🚀

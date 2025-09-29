# 🔧 Fix Database URL - Railway Internal vs Public

## 🚨 **The Problem**
You're using Railway's **internal** database URL, which only works within Railway's network. Your Next.js app running locally (or on Vercel) needs the **public** URL.

## ❌ **Internal URL (Current - Won't Work)**
```
postgresql://postgres:wKTLnvKktIKBSGVlxRRquukCfaVQbALT@postgres.railway.internal:5432/railway
```
- Only works **inside** Railway's network
- **Won't work** from your local machine
- **Won't work** from Vercel deployment

## ✅ **Public URL (What You Need)**
```
postgresql://postgres:wKTLnvKktIKBSGVlxRRquukCfaVQbALT@nozomi.proxy.rlwy.net:48306/railway
```
- Works from **anywhere** on the internet
- Works from your **local development**
- Works from **Vercel production**

## 🔧 **Fix Steps**

### **1. Update Your Local .env.local File**
Replace the DATABASE_URL in your `.env.local`:

```env
# OLD (Internal - Remove this):
DATABASE_URL="postgresql://postgres:wKTLnvKktIKBSGVlxRRquukCfaVQbALT@postgres.railway.internal:5432/railway"

# NEW (Public - Use this):
DATABASE_URL="postgresql://postgres:wKTLnvKktIKBSGVlxRRquukCfaVQbALT@nozomi.proxy.rlwy.net:48306/railway"
```

### **2. Test the Connection**
```bash
# Test database connection
npx prisma db push

# If successful, generate client
npx prisma generate
```

### **3. For Vercel Production**
Add the **public** URL to your Vercel environment variables:
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Update `DATABASE_URL` with the public URL

## 🎯 **Key Differences**

| Type | Host | Port | Works From |
|------|------|------|------------|
| Internal | `postgres.railway.internal` | `5432` | Only Railway services |
| Public | `nozomi.proxy.rlwy.net` | `48306` | Anywhere on internet |

## ✅ **After Fixing**
Your signup page at `/signup` will work because your app can now connect to the database!

## 🔍 **How to Find URLs in Railway**
1. Go to Railway dashboard
2. Click your PostgreSQL service
3. Go to "Variables" tab
4. **Internal URL**: `DATABASE_PRIVATE_URL`
5. **Public URL**: `DATABASE_URL` (this is what you want!)

## 🚀 **Test It Works**
After updating, test your signup page:
1. Go to `http://localhost:3000/signup`
2. Fill out the form
3. Should work without database connection errors!

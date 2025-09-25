#!/bin/bash

echo "🗄️  Setting up ServiceFlow Database..."
echo "======================================"

echo ""
echo "1️⃣  Generating Prisma Client..."
npx prisma generate

echo ""
echo "2️⃣  Creating database migration..."
npx prisma migrate dev --name init-production

echo ""
echo "3️⃣  Checking database connection..."
npx prisma db push

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🎯 Your database now has:"
echo "   - Organizations (multi-tenant)"
echo "   - Users (with NextAuth)"
echo "   - Customers, Appointments, Invoices"
echo "   - Stripe subscription tracking"
echo ""
echo "🚀 Ready to test subscriptions!"
echo "   Visit: http://localhost:3000/pricing-new"

#!/usr/bin/env node

console.log('🗄️  VervidFlow Database Setup');
console.log('===============================\n');

console.log('After updating your DATABASE_URL in .env.local, run these commands:\n');

console.log('1️⃣  Generate Prisma Client:');
console.log('   npx prisma generate\n');

console.log('2️⃣  Create and run database migration:');
console.log('   npx prisma migrate dev --name init-production\n');

console.log('3️⃣  (Optional) View your database:');
console.log('   npx prisma studio\n');

console.log('4️⃣  Test the connection:');
console.log('   npx prisma db push\n');

console.log('✅ After setup, your database will have:');
console.log('   - Organizations table (multi-tenant)');
console.log('   - Users with NextAuth support');
console.log('   - Customers, Appointments, Invoices');
console.log('   - Stripe subscription tracking');
console.log('   - All relationships properly configured\n');

console.log('💡 Railway Benefits:');
console.log('   - $5/month for 8GB storage');
console.log('   - Automatic backups');
console.log('   - Easy scaling');
console.log('   - Built-in monitoring');
console.log('   - Can migrate to Supabase later\n');

console.log('🚀 Ready to test subscriptions after database setup!');

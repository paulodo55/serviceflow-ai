const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "YOUR_RAILWAY_URL_HERE"
    }
  }
})

async function main() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful!')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()

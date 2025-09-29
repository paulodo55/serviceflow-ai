import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Validate and fix DATABASE_URL format
function validateDatabaseUrl(): string | undefined {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.warn('DATABASE_URL not configured');
    return undefined;
  }

  // Check for common issues in DATABASE_URL
  try {
    const url = new URL(dbUrl);
    
    // Ensure port is valid
    if (url.port && isNaN(Number(url.port))) {
      console.error('Invalid port in DATABASE_URL:', url.port);
      return undefined;
    }
    
    // Ensure protocol is correct
    if (!url.protocol.startsWith('postgresql')) {
      console.error('Invalid protocol in DATABASE_URL:', url.protocol);
      return undefined;
    }
    
    return dbUrl;
  } catch (error) {
    console.error('Invalid DATABASE_URL format:', error);
    return undefined;
  }
}

const validatedDbUrl = validateDatabaseUrl();

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: validatedDbUrl ? {
    db: {
      url: validatedDbUrl
    }
  } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

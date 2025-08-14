import * as dotenv from 'dotenv';
dotenv.config(); // Load variables from .env

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Check if DATABASE_URL is provided (Railway style)
const databaseUrl = process.env.DATABASE_URL;

let pool: Pool;

if (databaseUrl) {
  // Use DATABASE_URL if provided (Railway style)
  console.log('✅ Using DATABASE_URL for database connection');
  console.log('🔗 Database URL format detected:', databaseUrl.substring(0, 20) + '...');
  
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
} else {
  // Fallback to individual parameters
  console.log('⚠️  DATABASE_URL not found, falling back to individual parameters');
  
  const requiredEnvVars = {
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    USER: process.env.USER,
    PASSWORD: process.env.PASSWORD,
    DATABASE: process.env.DATABASE,
  };

  // Check if any required environment variables are missing
  const missingVars: string[] = [];
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missingVars.push(key);
    }
  }
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    console.error('💡 Please set DATABASE_URL or individual database parameters');
    console.error('📖 Check RAILWAY_ENV_SETUP.md for setup instructions');
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}. Please set DATABASE_URL or individual database parameters.`);
  }

  // Type assertion after validation to ensure non-null values
  const validatedEnvVars = {
    HOST: requiredEnvVars.HOST as string,
    PORT: requiredEnvVars.PORT as string,
    USER: requiredEnvVars.USER as string,
    PASSWORD: requiredEnvVars.PASSWORD as string,
    DATABASE: requiredEnvVars.DATABASE as string,
  };

  // Optional: Log to confirm env values are loaded (remove in production)
  console.log('Connecting to DB with individual parameters:', {
    host: validatedEnvVars.HOST,
    port: validatedEnvVars.PORT,
    user: validatedEnvVars.USER,
    database: validatedEnvVars.DATABASE,
  });

  pool = new Pool({
    host: validatedEnvVars.HOST,
    port: Number(validatedEnvVars.PORT || '5432'),
    user: validatedEnvVars.USER,
    password: validatedEnvVars.PASSWORD,
    database: validatedEnvVars.DATABASE,
  });
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const db = drizzle(pool);

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// Test connection on startup
testDatabaseConnection().catch(console.error);

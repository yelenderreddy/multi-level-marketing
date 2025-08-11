import * as dotenv from 'dotenv';
dotenv.config(); // Load variables from .env

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Validate required environment variables
const requiredEnvVars = {
  HOST: process.env.HOST,
  PORT: process.env.PORT,
  USER: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  DATABASE: process.env.DATABASE,
};

// Check if any required environment variables are missing
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
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
console.log('Connecting to DB:', {
  host: validatedEnvVars.HOST,
  port: validatedEnvVars.PORT,
  user: validatedEnvVars.USER,
  database: validatedEnvVars.DATABASE,
});

const pool = new Pool({
  host: validatedEnvVars.HOST,
  port: Number(validatedEnvVars.PORT || '5432'),
  user: validatedEnvVars.USER,
  password: validatedEnvVars.PASSWORD,
  database: validatedEnvVars.DATABASE,
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const db = drizzle(pool);

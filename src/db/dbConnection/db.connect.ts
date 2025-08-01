import * as dotenv from 'dotenv';
dotenv.config(); // Load variables from .env

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Optional: Log to confirm env values are loaded (remove in production)
console.log('Connecting to DB:', {
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USER,
  database: process.env.DATABASE,
});

const pool = new Pool({
  host: process.env.HOST || 'localhost',
  port: Number(process.env.PORT) || 5432,
  user: process.env.USER || 'postgres',
  password: process.env.PASSWORD || 'reddy',
  database: process.env.DATABASE || 'MLM_Db', // Correct fallback
});

export const db = drizzle(pool);

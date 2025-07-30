import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.DB_HOST)
// Supabase connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Fallback to individual parameters if DATABASE_URL is not provided
  host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
  port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'postgres'),
  user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
  password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('🔗 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

export default pool;
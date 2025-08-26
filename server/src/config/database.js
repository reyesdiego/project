const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'scoreteam',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  min: 4
};

const pool = new Pool(dbConfig);

// Test database connection
pool.query('SELECT 1')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });

module.exports = pool;

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  try {
    console.log('Connecting to NeonDB...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema setup...');
    await pool.query(schemaSQL);
    
    console.log('✅ Database schema initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
  } finally {
    await pool.end();
  }
}

initDB();

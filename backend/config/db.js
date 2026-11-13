const { Pool } = require('pg');
const { PGlite } = require('@electric-sql/pglite');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const isVercel = Boolean(process.env.VERCEL);
const dataDir = isVercel
  ? path.join('/tmp', 'pgdata')
  : path.join(__dirname, '..', 'database', 'pgdata');

try {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
} catch (_) {}

let activeMode = 'checking'; // 'native' | 'pglite'
let nativePool = null;
let pgliteInstance = null;

// Determine connection strategy (supports DATABASE_URL, POSTGRES_URL, or STORAGE_URL from Neon/Vercel)
const connectionString = (
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.STORAGE_URL ||
  process.env.STORAGE_DATABASE_URL
);

if (connectionString) {
  nativePool = new Pool({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
} else {
  nativePool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT, 10) || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'library_db',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

nativePool.on('error', () => {
  // Suppress uncaught background pool errors when fallback is used
});

let initPromise = null;

async function autoSeedIfEmpty(clientOrPool) {
  try {
    let shouldSeed = false;
    try {
      const checkBooks = await clientOrPool.query("SELECT COUNT(*) as count FROM books");
      const bookCount = parseInt(checkBooks.rows[0].count, 10);
      const checkUsers = await clientOrPool.query("SELECT COUNT(*) as count FROM users");
      const userCount = parseInt(checkUsers.rows[0].count, 10);
      if (bookCount < 5 || userCount < 2) {
        shouldSeed = true;
      }
    } catch (_) {
      shouldSeed = true;
    }

    if (shouldSeed) {
      console.log('🌱 Applying schema and seeding showcase data...');
      try {
        const { seedShowcase } = require('../scripts/seed_showcase');
        await seedShowcase(clientOrPool);
      } catch (seedErr) {
        console.warn('Notice on showcase seed fallback:', seedErr.message);
      }
    }
  } catch (err) {
    console.warn('Notice on auto-seeding check:', err.message);
  }
}

async function getEngine() {
  if (activeMode === 'native') return { mode: 'native', pool: nativePool };
  if (activeMode === 'pglite') return { mode: 'pglite', pglite: pgliteInstance };

  if (initPromise) return initPromise;

  initPromise = (async () => {
    // 1. Attempt native/cloud PostgreSQL connection
    try {
      const client = await nativePool.connect();
      await client.query('SELECT 1');
      await autoSeedIfEmpty(client);
      client.release();
      activeMode = 'native';
      console.log('📦 Database: Connected to PostgreSQL service.');
      return { mode: 'native', pool: nativePool };
    } catch (err) {
      // 2. If external database is not reachable, fallback to persistent/tmp PGlite
      activeMode = 'pglite';
      pgliteInstance = new PGlite(dataDir);
      console.log(`📦 Database: Running with embedded PostgreSQL engine (PGlite) [Storage: ${dataDir}]`);
      await autoSeedIfEmpty(pgliteInstance);
      return { mode: 'pglite', pglite: pgliteInstance };
    }
  })();

  return initPromise;
}

// Unified query wrapper
async function query(text, params = []) {
  const engine = await getEngine();
  if (engine.mode === 'native') {
    return engine.pool.query(text, params);
  } else {
    const res = await engine.pglite.query(text, params);
    return {
      rows: res.rows || [],
      rowCount: res.rowCount ?? (res.rows ? res.rows.length : 0),
    };
  }
}

// Unified client connection wrapper for transactions
async function connectClient() {
  const engine = await getEngine();
  if (engine.mode === 'native') {
    return engine.pool.connect();
  } else {
    return {
      query: async (text, params = []) => {
        const res = await engine.pglite.query(text, params);
        return {
          rows: res.rows || [],
          rowCount: res.rowCount ?? (res.rows ? res.rows.length : 0),
        };
      },
      release: () => {},
    };
  }
}

module.exports = {
  query,
  pool: {
    connect: connectClient,
    query,
  },
  getEngine,
};

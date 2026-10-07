const { Pool } = require('pg');
const { PGlite } = require('@electric-sql/pglite');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const dataDir = path.join(__dirname, '..', 'database', 'pgdata');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let activeMode = 'checking'; // 'native' | 'pglite'
let nativePool = null;
let pgliteInstance = null;

// Initialize native pool
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

nativePool.on('error', () => {
  // Suppress uncaught background pool errors when fallback is used
});

let initPromise = null;

async function getEngine() {
  if (activeMode === 'native') return { mode: 'native', pool: nativePool };
  if (activeMode === 'pglite') return { mode: 'pglite', pglite: pgliteInstance };

  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Attempt native PostgreSQL ping
    try {
      const client = await nativePool.connect();
      await client.query('SELECT 1');
      client.release();
      activeMode = 'native';
      console.log('📦 Database: Connected to external PostgreSQL service on port ' + (process.env.PGPORT || 5432));
      return { mode: 'native', pool: nativePool };
    } catch (err) {
      // Port 5432 not reachable, fallback to persistent embedded PostgreSQL (PGlite)
      activeMode = 'pglite';
      pgliteInstance = new PGlite(dataDir);
      console.log('📦 Database: Running with embedded persistent PostgreSQL engine (PGlite)');
      
      // Check if schema has been applied; if not, apply it and seed
      try {
        const checkTable = await pgliteInstance.query(
          "SELECT 1 FROM information_schema.tables WHERE table_name = 'users'"
        );
        if (checkTable.rows.length === 0) {
          console.log('🌱 Applying schema and seeding embedded PostgreSQL database...');
          const setupScript = require('../database/setup');
          if (setupScript.seedWithClient) {
            await setupScript.seedWithClient(pgliteInstance);
          }
        }
      } catch (setupErr) {
        console.error('Error auto-seeding embedded database:', setupErr.message);
      }

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
    // Return compatible client interface for PGlite
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

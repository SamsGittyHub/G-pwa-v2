import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '10.10.10.2',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASS || 'securepassword123',
};

const pool = new pg.Pool(dbConfig);

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'tripleg-secret-key-change-in-production';

// Middleware
app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'authorization, content-type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Password hashing
async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt.toString('hex') + ':' + derivedKey.toString('hex'));
    });
  });
}

async function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    const [saltHex, hashHex] = storedHash.split(':');
    if (!saltHex || !hashHex) return resolve(false);
    
    const salt = Buffer.from(saltHex, 'hex');
    crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') === hashHex);
    });
  });
}

// JWT functions
function createToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Auth endpoint
app.post('/api/auth', async (req, res) => {
  const { action, email, password, username: usernameInput } = req.body;
  
  try {
    switch (action) {
      case 'signup': {
        if (!email || !password || !usernameInput) {
          return res.status(400).json({ success: false, error: 'Email, username, and password are required' });
        }

        const existing = await pool.query(
          'SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1',
          [email, usernameInput]
        );

        if (existing.rows.length > 0) {
          return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const passwordHash = await hashPassword(password);
        const result = await pool.query(
          `INSERT INTO users (email, username, password_hash, created_at) 
           VALUES ($1, $2, $3, NOW()) 
           RETURNING id, email, username`,
          [email, usernameInput, passwordHash]
        );

        const user = result.rows[0];
        const token = createToken({ user_id: user.id, email: user.email, username: user.username });

        return res.json({ success: true, user: { id: user.id, email: user.email, username: user.username }, token });
      }

      case 'login': {
        if (!usernameInput || !password) {
          return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        const result = await pool.query(
          'SELECT id, email, username, password_hash FROM users WHERE username = $1 LIMIT 1',
          [usernameInput]
        );

        if (result.rows.length === 0) {
          return res.status(400).json({ success: false, error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const validPassword = await verifyPassword(password, user.password_hash);
        
        if (!validPassword) {
          return res.status(400).json({ success: false, error: 'Invalid credentials' });
        }

        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        const token = createToken({ user_id: user.id, email: user.email, username: user.username });

        return res.json({ success: true, user: { id: user.id, email: user.email, username: user.username }, token });
      }

      case 'verify': {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
          return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const payload = verifyToken(token);
        
        if (!payload) {
          return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        const result = await pool.query(
          'SELECT id, email, username FROM users WHERE id = $1 LIMIT 1',
          [payload.user_id]
        );

        if (result.rows.length === 0) {
          return res.status(401).json({ success: false, error: 'User not found' });
        }

        return res.json({ success: true, user: result.rows[0] });
      }

      default:
        return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// Database endpoint
app.post('/api/db', async (req, res) => {
  const { action, query, table, data, filters } = req.body;

  try {
    let result;

    switch (action) {
      case 'query':
        if (!query) {
          return res.status(400).json({ success: false, error: 'Query is required' });
        }
        if (!query.trim().toUpperCase().startsWith('SELECT')) {
          return res.status(400).json({ success: false, error: 'Only SELECT queries are allowed' });
        }
        result = await pool.query(query);
        break;

      case 'list_tables':
        result = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          ORDER BY table_name
        `);
        break;

      case 'describe_table':
        if (!table) {
          return res.status(400).json({ success: false, error: 'Table name is required' });
        }
        result = await pool.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [table]);
        break;

      case 'select': {
        if (!table) {
          return res.status(400).json({ success: false, error: 'Table name is required' });
        }
        let selectQuery = `SELECT * FROM "${table}"`;
        const values = [];
        if (filters && Object.keys(filters).length > 0) {
          const whereClauses = Object.keys(filters).map((key, i) => {
            values.push(filters[key]);
            return `"${key}" = $${i + 1}`;
          });
          selectQuery += ` WHERE ${whereClauses.join(' AND ')}`;
        }
        selectQuery += ' LIMIT 100';
        result = await pool.query(selectQuery, values);
        break;
      }

      case 'insert': {
        if (!table || !data) {
          return res.status(400).json({ success: false, error: 'Table and data are required' });
        }
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertQuery = `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
        result = await pool.query(insertQuery, values);
        break;
      }

      case 'update': {
        if (!table || !data || !filters) {
          return res.status(400).json({ success: false, error: 'Table, data, and filters are required' });
        }
        const dataKeys = Object.keys(data);
        const dataValues = Object.values(data);
        const filterKeys = Object.keys(filters);
        const filterValues = Object.values(filters);
        
        const setClauses = dataKeys.map((key, i) => `"${key}" = $${i + 1}`).join(', ');
        const whereClauses = filterKeys.map((key, i) => `"${key}" = $${dataKeys.length + i + 1}`).join(' AND ');
        
        const updateQuery = `UPDATE "${table}" SET ${setClauses} WHERE ${whereClauses} RETURNING *`;
        result = await pool.query(updateQuery, [...dataValues, ...filterValues]);
        break;
      }

      case 'delete': {
        if (!table || !filters) {
          return res.status(400).json({ success: false, error: 'Table and filters are required' });
        }
        const filterKeys = Object.keys(filters);
        const filterValues = Object.values(filters);
        const whereClauses = filterKeys.map((key, i) => `"${key}" = $${i + 1}`).join(' AND ');
        const deleteQuery = `DELETE FROM "${table}" WHERE ${whereClauses} RETURNING *`;
        result = await pool.query(deleteQuery, filterValues);
        break;
      }

      default:
        return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
    }

    return res.json({ success: true, data: result.rows, rowCount: result.rows.length });
  } catch (error) {
    console.error('DB error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Database error' });
  }
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle SPA routing - serve index.html for all non-file routes
// Express 5 requires different wildcard syntax
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
});

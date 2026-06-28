const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDB() {
  await client.batch([
    `CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      pan_card TEXT,
      phone_no TEXT,
      acc_no TEXT,
      disbursed_date TEXT,
      disbursed_amt REAL DEFAULT 0,
      overdue REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      agent_assigned TEXT DEFAULT 'Admin',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS emi_plans (
      id TEXT PRIMARY KEY,
      name TEXT,
      dob TEXT,
      pan_card TEXT,
      mobile TEXT,
      address TEXT,
      acc_no TEXT,
      emi_start_date TEXT,
      emi_end_date TEXT,
      total_emi INTEGER DEFAULT 0,
      total_paid_emi INTEGER DEFAULT 0,
      total_amt REAL DEFAULT 0,
      amt_left REAL DEFAULT 0,
      monthly_emi REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      name TEXT,
      acc_no TEXT,
      amount REAL DEFAULT 0,
      type TEXT,
      date TEXT,
      mode TEXT DEFAULT 'cash',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'pending',
      assigned_to TEXT DEFAULT 'Admin',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS topups (
      id TEXT PRIMARY KEY,
      acc_no TEXT,
      topup_amount REAL DEFAULT 0,
      emi_start_date TEXT,
      emi_end_date TEXT,
      monthly_emi REAL DEFAULT 0,
      status TEXT DEFAULT 'Active',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS moratoria (
      id TEXT PRIMARY KEY,
      acc_no TEXT,
      moratorium_start TEXT,
      moratorium_end TEXT,
      interest_accrual TEXT DEFAULT 'no',
      new_emi_end_date TEXT,
      status TEXT DEFAULT 'Active',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      type TEXT,
      description TEXT,
      customer_name TEXT,
      acc_no TEXT,
      amount REAL DEFAULT 0,
      performed_by TEXT DEFAULT 'Admin',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
  ], 'write');

  console.log('✅ Turso DB initialized');
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

module.exports = { client, initDB, generateId };

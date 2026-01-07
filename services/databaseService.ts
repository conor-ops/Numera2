import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BusinessData, Transaction, BankAccount, AccountType, HistoryRecord, BudgetTargets, BusinessDocument, FinancialItem, PricingItem, RunwaySnapshot, Business } from '../types';

let sqlite: SQLiteConnection;
let db: SQLiteDBConnection;

export const setupDatabase = async (): Promise<boolean> => {
  if (Capacitor.getPlatform() === 'web') {
    return true;
  }

  try {
    sqlite = new SQLiteConnection(CapacitorSQLite);
    db = await sqlite.createConnection('numera_db', false, 'no-encryption', 1, false);
    await db.open();

    const schema = `
      CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        is_default INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        business_id TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        name TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        type TEXT NOT NULL,
        FOREIGN KEY(business_id) REFERENCES businesses(id)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        business_id TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        type TEXT CHECK(type IN ('INCOME', 'EXPENSE')) NOT NULL,
        name TEXT,
        date_occurred TEXT,
        date_due TEXT,
        status TEXT DEFAULT 'PENDING',
        linked_doc_id TEXT,
        FOREIGN KEY(business_id) REFERENCES businesses(id)
      );

      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id TEXT PRIMARY KEY NOT NULL,
        business_id TEXT NOT NULL,
        name TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        frequency TEXT DEFAULT 'MONTHLY',
        FOREIGN KEY(business_id) REFERENCES businesses(id)
      );
      
      CREATE TABLE IF NOT EXISTS pricing_sheet (
        id TEXT PRIMARY KEY NOT NULL,
        business_id TEXT NOT NULL,
        name TEXT NOT NULL,
        supplier_cost_cents INTEGER NOT NULL,
        freight_cost_cents INTEGER NOT NULL,
        markup_percent REAL NOT NULL,
        FOREIGN KEY(business_id) REFERENCES businesses(id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT NOT NULL,
        business_id TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (key, business_id),
        FOREIGN KEY(business_id) REFERENCES businesses(id)
      );

      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY NOT NULL,
        business_id TEXT NOT NULL,
        date_iso TEXT NOT NULL,
        bne_cents INTEGER NOT NULL,
        assets_cents INTEGER NOT NULL,
        liabilities_cents INTEGER NOT NULL,
        FOREIGN KEY(business_id) REFERENCES businesses(id)
      );

      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY NOT NULL,
        business_id TEXT NOT NULL,
        data_json TEXT NOT NULL,
        FOREIGN KEY(business_id) REFERENCES businesses(id)
      );

      CREATE TABLE IF NOT EXISTS runway_snapshots (
        date_iso TEXT NOT NULL,
        business_id TEXT NOT NULL,
        days_remaining REAL NOT NULL,
        bne_cents INTEGER NOT NULL,
        monthly_burn_cents INTEGER NOT NULL,
        PRIMARY KEY (date_iso, business_id),
        FOREIGN KEY(business_id) REFERENCES businesses(id)
      );
    `;

    await db.execute(schema);
    return true;
  } catch (err) {
    console.error('DB Setup Error:', err);
    return false;
  }
};

/**
 * Business Entity Management
 */
export const getBusinesses = async (): Promise<Business[]> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem('numera_businesses') || '[]';
    return JSON.parse(raw);
  }
  if (!db) return [];
  const result = await db.query('SELECT * FROM businesses ORDER BY created_at ASC');
  return (result.values || []).map(row => ({
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    isDefault: row.is_default === 1
  }));
};

export const createBusiness = async (name: string, isDefault: boolean = false): Promise<Business> => {
  const newBusiness: Business = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    isDefault
  };

  if (Capacitor.getPlatform() === 'web') {
    const businesses = await getBusinesses();
    businesses.push(newBusiness);
    localStorage.setItem('numera_businesses', JSON.stringify(businesses));
    return newBusiness;
  }

  if (!db) throw new Error('DB not initialized');
  await db.run(
    'INSERT INTO businesses (id, name, created_at, is_default) VALUES (?, ?, ?, ?)',
    [newBusiness.id, newBusiness.name, newBusiness.createdAt, isDefault ? 1 : 0]
  );
  return newBusiness;
};

export const ensureDefaultBusiness = async (): Promise<Business> => {
  const businesses = await getBusinesses();
  if (businesses.length > 0) return businesses[0];
  return await createBusiness('Main Workspace', true);
};

export const saveSnapshot = async (data: BusinessData): Promise<void> => {
  const bid = data.businessId;
  if (Capacitor.getPlatform() === 'web') {
    localStorage.setItem(`numera_mock_db_${bid}`, JSON.stringify(data));
    return;
  }

  if (!db) throw new Error('DB not initialized');

  try {
    await db.execute('BEGIN TRANSACTION');
    // Delete only for THIS business
    await db.run('DELETE FROM accounts WHERE business_id = ?', [bid]);
    await db.run('DELETE FROM transactions WHERE business_id = ?', [bid]);
    await db.run('DELETE FROM recurring_expenses WHERE business_id = ?', [bid]);
    await db.run('DELETE FROM pricing_sheet WHERE business_id = ?', [bid]);

    for (const acc of data.accounts) {
      const cents = Math.round(acc.amount * 100);
      await db.run(
        'INSERT INTO accounts (id, business_id, bank_name, name, amount_cents, type) VALUES (?, ?, ?, ?, ?, ?)',
        [acc.id, bid, acc.bankName, acc.name, cents, acc.type]
      );
    }

    for (const tx of data.transactions) {
      const cents = Math.round(tx.amount * 100);
      await db.run(
        'INSERT INTO transactions (id, business_id, amount_cents, type, name, date_occurred, date_due, status, linked_doc_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [tx.id, bid, cents, tx.type, tx.name, tx.date_occurred, tx.date_due || null, tx.status || 'PENDING', tx.linkedDocId || null]
      );
    }

    // Save Monthly
    for (const exp of data.monthlyOverhead) {
      const cents = Math.round(exp.amount * 100);
      await db.run(
        'INSERT INTO recurring_expenses (id, business_id, name, amount_cents, frequency) VALUES (?, ?, ?, ?, ?)',
        [exp.id, bid, exp.name, cents, 'MONTHLY']
      );
    }
    
    // Save Annual
    for (const exp of data.annualOverhead) {
      const cents = Math.round(exp.amount * 100);
      await db.run(
        'INSERT INTO recurring_expenses (id, business_id, name, amount_cents, frequency) VALUES (?, ?, ?, ?, ?)',
        [exp.id, bid, exp.name, cents, 'ANNUAL']
      );
    }

    // Save Pricing Sheet
    for (const item of data.pricingSheet || []) {
      await db.run(
        'INSERT INTO pricing_sheet (id, business_id, name, supplier_cost_cents, freight_cost_cents, markup_percent) VALUES (?, ?, ?, ?, ?, ?)',
        [item.id, bid, item.name, Math.round(item.supplierCost * 100), Math.round(item.freightCost * 100), item.markupPercent]
      );
    }
    
    await db.run('INSERT OR REPLACE INTO settings (key, business_id, value) VALUES (?, ?, ?)', ['budget_targets', bid, JSON.stringify(data.targets)]);
    await db.execute('COMMIT');
  } catch (error) {
    await db.execute('ROLLBACK');
    console.error('Save Snapshot Failed:', error);
    throw error;
  }
};

export const loadSnapshot = async (businessId: string): Promise<BusinessData | null> => {
  const defaultTargets: BudgetTargets = { arTarget: 0, apTarget: 0, creditTarget: 0 };
  
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem(`numera_mock_db_${businessId}`);
    if (raw) {
        const data = JSON.parse(raw);
        if (!data.targets) data.targets = defaultTargets;
        // Migration/Safety checks for new fields
        if (!data.transactions) data.transactions = [];
        if (!data.accounts) data.accounts = [];
        if (!data.monthlyOverhead) data.monthlyOverhead = data.recurringExpenses || [];
        if (!data.annualOverhead) data.annualOverhead = [];
        if (!data.pricingSheet) data.pricingSheet = [];
        data.businessId = businessId;
        return data;
    }
    return null;
  }

  if (!db) return null;

  try {
    const accResult = await db.query('SELECT * FROM accounts WHERE business_id = ?', [businessId]);
    const accounts: BankAccount[] = (accResult.values || []).map(row => ({
      id: row.id,
      bankName: row.bank_name,
      name: row.name,
      amount: row.amount_cents / 100,
      type: row.type as AccountType
    }));

    const txResult = await db.query('SELECT * FROM transactions WHERE business_id = ?', [businessId]);
    const transactions: Transaction[] = (txResult.values || []).map(row => ({
      id: row.id,
      amount: row.amount_cents / 100,
      type: row.type as any,
      name: row.name,
      date_occurred: row.date_occurred,
      date_due: row.date_due,
      status: row.status as any,
      linkedDocId: row.linked_doc_id
    }));

    const recurResult = await db.query('SELECT * FROM recurring_expenses WHERE business_id = ?', [businessId]);
    const monthlyOverhead: FinancialItem[] = (recurResult.values || [])
      .filter(row => row.frequency === 'MONTHLY' || !row.frequency)
      .map(row => ({
        id: row.id,
        name: row.name,
        amount: row.amount_cents / 100
      }));

    const annualOverhead: FinancialItem[] = (recurResult.values || [])
      .filter(row => row.frequency === 'ANNUAL')
      .map(row => ({
        id: row.id,
        name: row.name,
        amount: row.amount_cents / 100
      }));

    const pricingResult = await db.query('SELECT * FROM pricing_sheet WHERE business_id = ?', [businessId]);
    const pricingSheet: PricingItem[] = (pricingResult.values || []).map(row => ({
      id: row.id,
      name: row.name,
      supplierCost: row.supplier_cost_cents / 100,
      freightCost: row.freight_cost_cents / 100,
      markupPercent: row.markup_percent
    }));
      
    const settingsResult = await db.query('SELECT value FROM settings WHERE key = ? AND business_id = ?', ['budget_targets', businessId]);
    let targets: BudgetTargets = defaultTargets;
    if (settingsResult.values && settingsResult.values.length > 0) {
        targets = JSON.parse(settingsResult.values[0].value);
    }

    return { businessId, accounts, transactions, targets, monthlyOverhead, annualOverhead, pricingSheet };
  } catch (err) {
    console.error('Load Snapshot Failed:', err);
    // Return empty but valid structure to prevent app crash
    return { 
      businessId,
      accounts: [], 
      transactions: [], 
      targets: defaultTargets, 
      monthlyOverhead: [], 
      annualOverhead: [], 
      pricingSheet: [] 
    };
  }
};

/**
 * Business Documents Persistence
 */
export const saveDocument = async (doc: BusinessDocument, businessId: string): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem(`numera_docs_${businessId}`) || '[]';
    const docs = JSON.parse(raw);
    const index = docs.findIndex((d: any) => d.id === doc.id);
    if (index >= 0) docs[index] = doc;
    else docs.unshift(doc);
    localStorage.setItem(`numera_docs_${businessId}`, JSON.stringify(docs));
    return;
  }
  if (!db) return;
  await db.run('INSERT OR REPLACE INTO documents (id, business_id, data_json) VALUES (?, ?, ?)', [doc.id, businessId, JSON.stringify(doc)]);
};

export const getDocuments = async (businessId: string): Promise<BusinessDocument[]> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem(`numera_docs_${businessId}`) || '[]';
    return JSON.parse(raw);
  }
  if (!db) return [];
  const result = await db.query('SELECT data_json FROM documents WHERE business_id = ?', [businessId]);
  return (result.values || []).map(row => JSON.parse(row.data_json));
};

export const deleteDocument = async (id: string, businessId: string): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem(`numera_docs_${businessId}`) || '[]';
    const docs = JSON.parse(raw).filter((d: any) => d.id !== id);
    localStorage.setItem(`numera_docs_${businessId}`, JSON.stringify(docs));
    return;
  }
  if (!db) return;
  await db.run('DELETE FROM documents WHERE id = ? AND business_id = ?', [id, businessId]);
};

/**
 * Settings
 */
export const getSetting = async (key: string, businessId: string): Promise<string | null> => {
  if (Capacitor.getPlatform() === 'web') {
    return localStorage.getItem(`numera_setting_${businessId}_${key}`);
  }
  if (!db) return null;
  try {
    const result = await db.query('SELECT value FROM settings WHERE key = ? AND business_id = ?', [key, businessId]);
    return result.values && result.values.length > 0 ? result.values[0].value : null;
  } catch (err) {
    return null;
  }
};

export const setSetting = async (key: string, businessId: string, value: string): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    localStorage.setItem(`numera_setting_${businessId}_${key}`, value);
    return;
  }
  if (!db) return;
  await db.run('INSERT OR REPLACE INTO settings (key, business_id, value) VALUES (?, ?, ?)', [key, businessId, value]);
};

export const saveHistoryRecord = async (record: HistoryRecord, businessId: string): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem(`numera_mock_history_${businessId}`);
    const history = raw ? JSON.parse(raw) : [];
    history.unshift(record);
    localStorage.setItem(`numera_mock_history_${businessId}`, JSON.stringify(history));
    return;
  }
  if (!db) return;
  await db.run(
    'INSERT INTO history (id, business_id, date_iso, bne_cents, assets_cents, liabilities_cents) VALUES (?, ?, ?, ?, ?, ?)',
    [record.id, businessId, record.date, Math.round(record.bne * 100), Math.round(record.assets * 100), Math.round(record.liabilities * 100)]
  );
};

export const getHistoryRecords = async (businessId: string): Promise<HistoryRecord[]> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem(`numera_mock_history_${businessId}`);
    return raw ? JSON.parse(raw) : [];
  }
  if (!db) return [];
  const result = await db.query('SELECT * FROM history WHERE business_id = ? ORDER BY date_iso DESC', [businessId]);
  return (result.values || []).map(row => ({
    id: row.id,
    date: row.date_iso,
    bne: row.bne_cents / 100,
    assets: row.assets_cents / 100,
    liabilities: row.liabilities_cents / 100
  }));
};

/**
 * Runway Trend Snapshots
 */
export const saveRunwaySnapshot = async (snapshot: RunwaySnapshot, businessId: string): Promise<void> => {
  // Use YYYY-MM-DD as the key to ensure one per day
  const dateKey = new Date(snapshot.date).toISOString().split('T')[0];

  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem(`numera_runway_history_${businessId}`) || '{}';
    const history = JSON.parse(raw);
    history[dateKey] = snapshot;
    localStorage.setItem(`numera_runway_history_${businessId}`, JSON.stringify(history));
    return;
  }

  if (!db) return;
  await db.run(
    'INSERT OR REPLACE INTO runway_snapshots (date_iso, business_id, days_remaining, bne_cents, monthly_burn_cents) VALUES (?, ?, ?, ?, ?)',
    [dateKey, businessId, snapshot.daysRemaining, Math.round(snapshot.bne * 100), Math.round(snapshot.monthlyBurn * 100)]
  );
};

export const getRunwaySnapshots = async (businessId: string, limit: number = 30): Promise<RunwaySnapshot[]> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem(`numera_runway_history_${businessId}`) || '{}';
    const history = JSON.parse(raw);
    return Object.values(history)
      .map((s: any) => ({ ...s }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  if (!db) return [];
  const result = await db.query('SELECT * FROM runway_snapshots WHERE business_id = ? ORDER BY date_iso DESC LIMIT ?', [businessId, limit]);
  return (result.values || []).map(row => ({
    date: row.date_iso,
    daysRemaining: row.days_remaining,
    bne: row.bne_cents / 100,
    monthlyBurn: row.monthly_burn_cents / 100
  }));
};
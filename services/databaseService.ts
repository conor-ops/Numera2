import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BusinessData, Transaction, BankAccount, AccountType, HistoryRecord, BudgetTargets, BusinessDocument, FinancialItem, PricingItem } from '../types';

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
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        bank_name TEXT NOT NULL,
        name TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        type TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        amount_cents INTEGER NOT NULL,
        type TEXT CHECK(type IN ('INCOME', 'EXPENSE')) NOT NULL,
        name TEXT,
        date_occurred TEXT,
        linked_doc_id TEXT
      );

      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        frequency TEXT DEFAULT 'MONTHLY'
      );
      
      CREATE TABLE IF NOT EXISTS pricing_sheet (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        supplier_cost_cents INTEGER NOT NULL,
        freight_cost_cents INTEGER NOT NULL,
        markup_percent REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY NOT NULL,
        date_iso TEXT NOT NULL,
        bne_cents INTEGER NOT NULL,
        assets_cents INTEGER NOT NULL,
        liabilities_cents INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY NOT NULL,
        data_json TEXT NOT NULL
      );
    `;

    await db.execute(schema);
    return true;
  } catch (err) {
    console.error('DB Setup Error:', err);
    return false;
  }
};

export const saveSnapshot = async (data: BusinessData): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    localStorage.setItem('numera_mock_db', JSON.stringify(data));
    return;
  }

  if (!db) throw new Error('DB not initialized');

  try {
    await db.execute('BEGIN TRANSACTION');
    await db.execute('DELETE FROM accounts');
    await db.execute('DELETE FROM transactions');
    await db.execute('DELETE FROM recurring_expenses');
    await db.execute('DELETE FROM pricing_sheet');

    for (const acc of data.accounts) {
      const cents = Math.round(acc.amount * 100);
      await db.run(
        'INSERT INTO accounts (id, bank_name, name, amount_cents, type) VALUES (?, ?, ?, ?, ?)',
        [acc.id, acc.bankName, acc.name, cents, acc.type]
      );
    }

    for (const tx of data.transactions) {
      const cents = Math.round(tx.amount * 100);
      await db.run(
        'INSERT INTO transactions (id, amount_cents, type, name, date_occurred, linked_doc_id) VALUES (?, ?, ?, ?, ?, ?)',
        [tx.id, cents, tx.type, tx.name, tx.date_occurred, tx.linkedDocId || null]
      );
    }

    // Save Monthly
    for (const exp of data.monthlyOverhead) {
      const cents = Math.round(exp.amount * 100);
      await db.run(
        'INSERT INTO recurring_expenses (id, name, amount_cents, frequency) VALUES (?, ?, ?, ?)',
        [exp.id, exp.name, cents, 'MONTHLY']
      );
    }
    
    // Save Annual
    for (const exp of data.annualOverhead) {
      const cents = Math.round(exp.amount * 100);
      await db.run(
        'INSERT INTO recurring_expenses (id, name, amount_cents, frequency) VALUES (?, ?, ?, ?)',
        [exp.id, exp.name, cents, 'ANNUAL']
      );
    }

    // Save Pricing Sheet
    for (const item of data.pricingSheet || []) {
      await db.run(
        'INSERT INTO pricing_sheet (id, name, supplier_cost_cents, freight_cost_cents, markup_percent) VALUES (?, ?, ?, ?, ?)',
        [item.id, item.name, Math.round(item.supplierCost * 100), Math.round(item.freightCost * 100), item.markupPercent]
      );
    }
    
    await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['budget_targets', JSON.stringify(data.targets)]);
    await db.execute('COMMIT');
  } catch (error) {
    await db.execute('ROLLBACK');
    console.error('Save Snapshot Failed:', error);
    throw error;
  }
};

export const loadSnapshot = async (): Promise<BusinessData | null> => {
  const defaultTargets: BudgetTargets = { arTarget: 0, apTarget: 0, creditTarget: 0 };
  
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem('numera_mock_db');
    if (raw) {
        const data = JSON.parse(raw);
        if (!data.targets) data.targets = defaultTargets;
        // Migration/Safety checks for new fields
        if (!data.monthlyOverhead) data.monthlyOverhead = data.recurringExpenses || [];
        if (!data.annualOverhead) data.annualOverhead = [];
        if (!data.pricingSheet) data.pricingSheet = [];
        return data;
    }
    return null;
  }

  if (!db) return null;

  try {
    const accResult = await db.query('SELECT * FROM accounts');
    const accounts: BankAccount[] = (accResult.values || []).map(row => ({
      id: row.id,
      bankName: row.bank_name,
      name: row.name,
      amount: row.amount_cents / 100,
      type: row.type as AccountType
    }));

    const txResult = await db.query('SELECT * FROM transactions');
    const transactions: Transaction[] = (txResult.values || []).map(row => ({
      id: row.id,
      amount: row.amount_cents / 100,
      type: row.type as any,
      name: row.name,
      date_occurred: row.date_occurred,
      linkedDocId: row.linked_doc_id
    }));

    const recurResult = await db.query('SELECT * FROM recurring_expenses');
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

    const pricingResult = await db.query('SELECT * FROM pricing_sheet');
    const pricingSheet: PricingItem[] = (pricingResult.values || []).map(row => ({
      id: row.id,
      name: row.name,
      supplierCost: row.supplier_cost_cents / 100,
      freightCost: row.freight_cost_cents / 100,
      markupPercent: row.markup_percent
    }));
      
    const settingsResult = await db.query('SELECT value FROM settings WHERE key = ?', ['budget_targets']);
    let targets: BudgetTargets = defaultTargets;
    if (settingsResult.values && settingsResult.values.length > 0) {
        targets = JSON.parse(settingsResult.values[0].value);
    }

    return { accounts, transactions, targets, monthlyOverhead, annualOverhead, pricingSheet };
  } catch (err) {
    console.error('Load Snapshot Failed:', err);
    return null;
  }
};

/**
 * Business Documents Persistence
 */
export const saveDocument = async (doc: BusinessDocument): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem('numera_docs') || '[]';
    const docs = JSON.parse(raw);
    const index = docs.findIndex((d: any) => d.id === doc.id);
    if (index >= 0) docs[index] = doc;
    else docs.unshift(doc);
    localStorage.setItem('numera_docs', JSON.stringify(docs));
    return;
  }
  if (!db) return;
  await db.run('INSERT OR REPLACE INTO documents (id, data_json) VALUES (?, ?)', [doc.id, JSON.stringify(doc)]);
};

export const getDocuments = async (): Promise<BusinessDocument[]> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem('numera_docs') || '[]';
    return JSON.parse(raw);
  }
  if (!db) return [];
  const result = await db.query('SELECT data_json FROM documents');
  return (result.values || []).map(row => JSON.parse(row.data_json));
};

export const deleteDocument = async (id: string): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem('numera_docs') || '[]';
    const docs = JSON.parse(raw).filter((d: any) => d.id !== id);
    localStorage.setItem('numera_docs', JSON.stringify(docs));
    return;
  }
  if (!db) return;
  await db.run('DELETE FROM documents WHERE id = ?', [id]);
};

/**
 * Settings
 */
export const getSetting = async (key: string): Promise<string | null> => {
  if (Capacitor.getPlatform() === 'web') {
    return localStorage.getItem(`numera_setting_${key}`);
  }
  if (!db) return null;
  try {
    const result = await db.query('SELECT value FROM settings WHERE key = ?', [key]);
    return result.values && result.values.length > 0 ? result.values[0].value : null;
  } catch (err) {
    return null;
  }
};

export const setSetting = async (key: string, value: string): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    localStorage.setItem(`numera_setting_${key}`, value);
    return;
  }
  if (!db) return;
  await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
};

export const saveHistoryRecord = async (record: HistoryRecord): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem('numera_mock_history');
    const history = raw ? JSON.parse(raw) : [];
    history.unshift(record);
    localStorage.setItem('numera_mock_history', JSON.stringify(history));
    return;
  }
  if (!db) return;
  await db.run(
    'INSERT INTO history (id, date_iso, bne_cents, assets_cents, liabilities_cents) VALUES (?, ?, ?, ?, ?)',
    [record.id, record.date, Math.round(record.bne * 100), Math.round(record.assets * 100), Math.round(record.liabilities * 100)]
  );
};

export const getHistoryRecords = async (): Promise<HistoryRecord[]> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem('numera_mock_history');
    return raw ? JSON.parse(raw) : [];
  }
  if (!db) return [];
  const result = await db.query('SELECT * FROM history ORDER BY date_iso DESC');
  return (result.values || []).map(row => ({
    id: row.id,
    date: row.date_iso,
    bne: row.bne_cents / 100,
    assets: row.assets_cents / 100,
    liabilities: row.liabilities_cents / 100
  }));
};
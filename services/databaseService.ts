
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { BusinessData, Transaction, BankAccount, AccountType, HistoryRecord } from '../types';

let sqlite: SQLiteConnection;
let db: SQLiteDBConnection;

export const setupDatabase = async (): Promise<boolean> => {
  if (Capacitor.getPlatform() === 'web') {
    console.warn('Web platform: SQLite disabled. Using localStorage mock.');
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
        date_occurred TEXT
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

    for (const acc of data.accounts) {
      const cents = Math.round(acc.amount * 100);
      await db.run(
        'INSERT INTO accounts (id, bank_name, name, amount_cents, type) VALUES (?, ?, ?, ?, ?)',
        // Fix: Use bankName property as bank_name does not exist on BankAccount type
        [acc.id, acc.bankName, acc.name, cents, acc.type]
      );
    }

    for (const tx of data.transactions) {
      const cents = Math.round(tx.amount * 100);
      await db.run(
        'INSERT INTO transactions (id, amount_cents, type, name, date_occurred) VALUES (?, ?, ?, ?, ?)',
        [tx.id, cents, tx.type, tx.name, tx.date_occurred]
      );
    }

    await db.execute('COMMIT');
    
  } catch (error) {
    await db.execute('ROLLBACK');
    console.error('Save Snapshot Failed:', error);
    throw error;
  }
};

export const loadSnapshot = async (): Promise<BusinessData | null> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem('numera_mock_db');
    return raw ? JSON.parse(raw) : null;
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
      date_occurred: row.date_occurred
    }));

    return { accounts, transactions };
  } catch (err) {
    console.error('Load Snapshot Failed:', err);
    return null;
  }
};

/**
 * History / Logging
 */
export const saveHistoryRecord = async (record: HistoryRecord): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem('numera_mock_history');
    const history = raw ? JSON.parse(raw) : [];
    history.unshift(record); // Add to beginning
    localStorage.setItem('numera_mock_history', JSON.stringify(history));
    return;
  }

  if (!db) throw new Error('DB not initialized');

  try {
    await db.run(
      'INSERT INTO history (id, date_iso, bne_cents, assets_cents, liabilities_cents) VALUES (?, ?, ?, ?, ?)',
      [
        record.id, 
        record.date, 
        Math.round(record.bne * 100), 
        Math.round(record.assets * 100), 
        Math.round(record.liabilities * 100)
      ]
    );
  } catch (err) {
    console.error('Failed to save history:', err);
    throw err;
  }
};

export const getHistoryRecords = async (): Promise<HistoryRecord[]> => {
  if (Capacitor.getPlatform() === 'web') {
    const raw = localStorage.getItem('numera_mock_history');
    return raw ? JSON.parse(raw) : [];
  }

  if (!db) return [];

  try {
    const result = await db.query('SELECT * FROM history ORDER BY date_iso DESC');
    return (result.values || []).map(row => ({
      id: row.id,
      date: row.date_iso,
      bne: row.bne_cents / 100,
      assets: row.assets_cents / 100,
      liabilities: row.liabilities_cents / 100
    }));
  } catch (err) {
    console.error('Failed to get history:', err);
    return [];
  }
};

/**
 * Settings & Entitlements Persistence
 */
export const getSetting = async (key: string): Promise<string | null> => {
  if (Capacitor.getPlatform() === 'web') {
    return localStorage.getItem(`numera_setting_${key}`);
  }

  if (!db) return null;

  try {
    const result = await db.query('SELECT value FROM settings WHERE key = ?', [key]);
    if (result.values && result.values.length > 0) {
      return result.values[0].value;
    }
    return null;
  } catch (err) {
    console.error(`Failed to get setting ${key}:`, err);
    return null;
  }
};

export const setSetting = async (key: string, value: string): Promise<void> => {
  if (Capacitor.getPlatform() === 'web') {
    localStorage.setItem(`numera_setting_${key}`, value);
    return;
  }

  if (!db) throw new Error('DB not initialized');

  try {
    // SQLite INSERT OR REPLACE handles upserts (updating if exists, inserting if new)
    await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  } catch (err) {
    console.error(`Failed to set setting ${key}:`, err);
    throw err;
  }
};

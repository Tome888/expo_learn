export const CREATE_USER = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    is_biometric_enabled INTEGER DEFAULT 0
  );
`;

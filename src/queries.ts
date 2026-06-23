export const CREATE_USER = `
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_biometric_enabled INTEGER DEFAULT 0
  );
`;

export const FAVORITE_POSTS = `
  CREATE TABLE IF NOT EXISTS favorite_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL
  );
`;

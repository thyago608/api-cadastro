import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../config.js';
import { createDatabase } from './client.js';

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));
const db = createDatabase(loadConfig().databaseUrl);

try {
  await db.query(await readFile(schemaPath, 'utf8'));
  console.log('Migração concluída.');
} finally {
  await db.end();
}

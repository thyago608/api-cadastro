import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createDatabase } from './db/client.js';

const config = loadConfig();
const db = createDatabase(config.databaseUrl);
const app = createApp({ db });
const server = app.listen(config.port, () => console.log(`API ouvindo na porta ${config.port}`));

async function shutdown() {
  server.close();
  await db.end();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

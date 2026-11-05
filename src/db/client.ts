import { Pool, type PoolClient } from 'pg';

export type Database = Pick<Pool, 'query' | 'connect' | 'end'>;

export function createDatabase(connectionString: string): Pool {
  return new Pool({ connectionString, ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false } });
}

export async function withTransaction<T>(db: Database, action: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await action(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

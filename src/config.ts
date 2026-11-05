import 'dotenv/config';

export type Config = {
  databaseUrl: string;
  port: number;
  nodeEnv: string;
};

export function loadConfig(env = process.env): Config {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL é obrigatório.');
  return { databaseUrl, port: Number(env.PORT ?? 3000), nodeEnv: env.NODE_ENV ?? 'development' };
}

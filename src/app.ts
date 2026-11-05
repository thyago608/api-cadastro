import express, { type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import type { PoolClient } from 'pg';
import { withTransaction, type Database } from './db/client.js';
import { preCadastroSchema, uploadSchema, type PreCadastro, type UploadPayload } from './schemas.js';

type AppOptions = { db: Database };
const multipart = multer().none();

function processNumber(code: string | number) {
  return String(code).padStart(10, '0');
}

async function createPreCadastro(client: PoolClient, body: PreCadastro) {
  const insert = await client.query<{ sin_evt_codigo: string; sin_proc_codigo: string }>(
    `INSERT INTO pre_cadastros (
      sin_proc_numero_sinistro, ctr_codigo, documento_segurado, nome_segurado, cob_tp_codigo,
      sin_nat_codigo, sin_ativ_codigo, sin_evt_local_ocorrencia, sin_evt_data,
      sin_evt_data_acidente, sin_proc_data_aviso, sin_evt_anotacoes, sin_proc_anotacoes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING sin_evt_codigo, sin_proc_codigo`,
    ['pending', body.Ctr_Codigo, body.DocumentoSegurado, body.NomeSegurado, body.CobTp_Codigo,
      body.SinNat_codigo, body.SinAtiv_codigo, body.SinEvt_Local_Ocorrencia, body.SinEvt_Data,
      body.SinEvt_Data_Acidente, body.SinProc_Data_Aviso, body.SinEvt_Anotacoes, body.SinProc_Anotacoes]
  );
  const { sin_evt_codigo, sin_proc_codigo } = insert.rows[0];
  const numero = processNumber(sin_proc_codigo);
  await client.query('UPDATE pre_cadastros SET sin_proc_numero_sinistro = $1 WHERE sin_evt_codigo = $2', [numero, sin_evt_codigo]);
  for (const item of body.Beneficiarios) {
    await client.query('INSERT INTO beneficiarios (sin_evt_codigo, sin_ben_codigo, sin_ben_percentual, tp_vinc_codigo) VALUES ($1,$2,$3,$4)',
      [sin_evt_codigo, item.SinBen_codigo, item.SinBen_Percentual, item.TpVinc_Codigo]);
  }
  for (const item of body.Despesas) {
    await client.query('INSERT INTO despesas (sin_evt_codigo, sin_ben_codigo, ind_texto, ind_valor) VALUES ($1,$2,$3,$4)',
      [sin_evt_codigo, item.SinBen_Codigo, item.Ind_Texto, item.Ind_Valor]);
  }
  return { SinEvt_Codigo: Number(sin_evt_codigo), SinProc_codigo: Number(sin_proc_codigo), SinProc_Numero_Sinistro: numero };
}

async function createDocuments(client: PoolClient, body: UploadPayload) {
  const responses = [];
  for (const item of body.data) {
    const exists = await client.query('SELECT 1 FROM pre_cadastros WHERE sin_evt_codigo = $1', [item.codigoEvento]);
    if (!exists.rowCount) {
      const error = new Error(`Evento ${item.codigoEvento} não encontrado.`) as Error & { status: number };
      error.status = 404;
      throw error;
    }
    await client.query('INSERT INTO documentos (sin_evt_codigo, url, nome_arquivo, descricao) VALUES ($1,$2,$3,$4)',
      [item.codigoEvento, item.url, item.nomeArquivo, item.descricao]);
    responses.push({ status: 'sucesso', nomeArquivo: item.nomeArquivo, codigoEvento: String(item.codigoEvento) });
  }
  return responses;
}

export function createApp({ db }: AppOptions) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.post('/integracaoBrick/preCadastro', async (req, res, next) => {
    try { res.status(201).json([await withTransaction(db, c => createPreCadastro(c, preCadastroSchema.parse(req.body)))]); }
    catch (error) { next(error); }
  });
  app.post('/integracaoBrick/upload', multipart, async (req, res, next) => {
    try {
      const raw = typeof req.body.data === 'string' ? { data: JSON.parse(req.body.data) } : req.body;
      res.status(201).json(await withTransaction(db, c => createDocuments(c, uploadSchema.parse(raw))));
    } catch (error) { next(error); }
  });
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ZodError) return res.status(400).json({ error: 'Dados inválidos.', details: error.flatten() });
    if (error instanceof SyntaxError) return res.status(400).json({ error: 'JSON inválido.' });
    const status = typeof error === 'object' && error && 'status' in error ? Number((error as { status: number }).status) : 500;
    if (status === 404) return res.status(404).json({ error: (error as Error).message });
    console.error(error);
    return res.status(500).json({ error: 'Erro interno.' });
  });
  return app;
}

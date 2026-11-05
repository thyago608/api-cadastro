import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD.');

export const preCadastroSchema = z.object({
  Ctr_Codigo: z.coerce.number().int().positive(),
  DocumentoSegurado: z.string().trim().min(1).max(40),
  NomeSegurado: z.string().trim().min(1).max(255),
  CobTp_Codigo: z.coerce.number().int().positive(),
  SinNat_codigo: z.coerce.number().int().positive(),
  SinAtiv_codigo: z.coerce.number().int().positive(),
  SinEvt_Local_Ocorrencia: z.coerce.number().int().positive(),
  SinEvt_Data: date,
  SinEvt_Data_Acidente: date,
  SinProc_Data_Aviso: date,
  SinEvt_Anotacoes: z.string().trim().min(1),
  SinProc_Anotacoes: z.string().trim().min(1),
  Beneficiarios: z.array(z.object({
    SinBen_codigo: z.coerce.number().int().positive(),
    SinBen_Percentual: z.coerce.number().min(0).max(100),
    TpVinc_Codigo: z.coerce.number().int().positive()
  })).default([]),
  Despesas: z.array(z.object({
    SinBen_Codigo: z.coerce.number().int().positive(),
    Ind_Texto: z.string().trim().min(1),
    Ind_Valor: z.coerce.number().nonnegative()
  })).default([])
}).strict();

export const uploadItemSchema = z.object({
  url: z.string().url().max(2048),
  nomeArquivo: z.string().trim().min(1).max(255),
  descricao: z.string().trim().min(1).max(500),
  codigoEvento: z.coerce.number().int().positive()
}).strict();

export const uploadSchema = z.object({ data: z.array(uploadItemSchema).min(1) }).strict();

export type PreCadastro = z.infer<typeof preCadastroSchema>;
export type UploadPayload = z.infer<typeof uploadSchema>;

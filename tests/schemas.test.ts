import { describe, expect, it } from 'vitest';
import { preCadastroSchema, uploadSchema } from '../src/schemas.js';

const preCadastro = {
  Ctr_Codigo: 343555, DocumentoSegurado: '049.910.136-74', NomeSegurado: 'EMELLY CRISTINY SOARES NARCISO',
  CobTp_Codigo: 25, SinNat_codigo: 16, SinAtiv_codigo: 11, SinEvt_Local_Ocorrencia: 1,
  SinEvt_Data: '2026-08-03', SinEvt_Data_Acidente: '2026-08-03', SinProc_Data_Aviso: '2026-10-29',
  SinEvt_Anotacoes: 'Anotações iniciais do evento de sinistro.', SinProc_Anotacoes: 'Anotações iniciais do processo de sinistro.',
  Beneficiarios: [{ SinBen_codigo: 34667, SinBen_Percentual: 100, TpVinc_Codigo: 9 }],
  Despesas: [{ SinBen_Codigo: 34667, Ind_Texto: '00.01.001-4', Ind_Valor: 100 }]
};

describe('contratos de integração', () => {
  it('aceita o payload de pré-cadastro documentado', () => {
    expect(preCadastroSchema.parse(preCadastro).NomeSegurado).toBe('EMELLY CRISTINY SOARES NARCISO');
  });
  it('recusa datas fora do formato do contrato', () => {
    expect(() => preCadastroSchema.parse({ ...preCadastro, SinEvt_Data: '03/08/2026' })).toThrow();
  });
  it('aceita o payload de documentos documentado', () => {
    expect(uploadSchema.parse({ data: [{ url: 'https://exemplo.com/documento.pdf', nomeArquivo: 'documento.pdf', descricao: 'documento', codigoEvento: 44509 }] }).data).toHaveLength(1);
  });
});

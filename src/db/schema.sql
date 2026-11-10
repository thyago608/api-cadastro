CREATE TABLE IF NOT EXISTS pre_cadastros (
  sin_evt_codigo BIGSERIAL PRIMARY KEY,
  sin_proc_codigo BIGSERIAL NOT NULL UNIQUE,
  sin_proc_numero_sinistro TEXT UNIQUE,
  ctr_codigo BIGINT NOT NULL,
  documento_segurado TEXT NOT NULL,
  nome_segurado TEXT NOT NULL,
  cob_tp_codigo INTEGER NOT NULL,
  sin_nat_codigo INTEGER NOT NULL,
  sin_ativ_codigo INTEGER NOT NULL,
  sin_evt_local_ocorrencia INTEGER NOT NULL,
  sin_evt_data DATE NOT NULL,
  sin_evt_data_acidente DATE NOT NULL,
  sin_proc_data_aviso DATE NOT NULL,
  sin_evt_anotacoes TEXT NOT NULL,
  sin_proc_anotacoes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS beneficiarios (
  id BIGSERIAL PRIMARY KEY,
  sin_evt_codigo BIGINT NOT NULL,
  sin_ben_codigo BIGINT NOT NULL,
  sin_ben_percentual NUMERIC(7,2) NOT NULL CHECK (sin_ben_percentual >= 0 AND sin_ben_percentual <= 100),
  tp_vinc_codigo INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS despesas (
  id BIGSERIAL PRIMARY KEY,
  sin_evt_codigo BIGINT NOT NULL,
  sin_ben_codigo BIGINT NOT NULL,
  ind_texto TEXT NOT NULL,
  ind_valor NUMERIC(14,2) NOT NULL CHECK (ind_valor >= 0)
);

CREATE TABLE IF NOT EXISTS documentos (
  id BIGSERIAL PRIMARY KEY,
  sin_evt_codigo BIGINT NOT NULL REFERENCES pre_cadastros(sin_evt_codigo) ON DELETE CASCADE,
  url TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A rota de despesas é uma simulação de integração e aceita códigos externos.
ALTER TABLE beneficiarios DROP CONSTRAINT IF EXISTS beneficiarios_sin_evt_codigo_fkey;
ALTER TABLE despesas DROP CONSTRAINT IF EXISTS despesas_sin_evt_codigo_fkey;

# API de Cadastro — Integração Brick

API em Node.js/TypeScript que persiste pré-cadastros, beneficiários, despesas e URLs de documentos em PostgreSQL (compatível com Neon).

O contrato OpenAPI está em [`openapi.yaml`](./openapi.yaml).

## Endpoints

Os endpoints são públicos e não exigem autenticação.

- `POST /integracaoBrick/preCadastro`: recebe o JSON exibido na documentação. Retorna uma lista com `SinEvt_Codigo`, `SinProc_codigo` e `SinProc_Numero_Sinistro`.
- `POST /integracaoBrick/upload`: aceita JSON (`{ "data": [...] }`) ou `multipart/form-data`, em que o campo `data` contém esse array em JSON. Cada item tem `url`, `nomeArquivo`, `descricao`, `codigoEvento`. Retorna a lista de status no mesmo formato do anexo.
- `GET /health`: verificação de saúde.

O endpoint de upload registra a URL fornecida; ele não baixa nem armazena o binário do arquivo. Isso corresponde aos campos da documentação recebida.

## Executar localmente

```bash
cp .env.example .env
# Preencha DATABASE_URL no .env
npm install
npm run db:migrate
npm run dev
```

Exemplo de pré-cadastro:

```bash
curl -X POST http://localhost:3000/integracaoBrick/preCadastro \
  -H 'Content-Type: application/json' \
  --data @exemplo-pre-cadastro.json
```

## Deploy no Railway + Neon

1. Crie um banco no Neon e copie a connection string com `sslmode=require`.
2. Crie um projeto no Railway a partir deste repositório. O `railway.toml` usa o `Dockerfile` e verifica `/health`.
3. Cadastre `DATABASE_URL` nas variáveis do Railway.
4. Rode uma vez, a partir de uma máquina com as mesmas variáveis: `npm run db:migrate`.
5. Faça o deploy e use a URL pública gerada pelo Railway como base dos endpoints.

As migrações são deliberadamente um passo separado do boot da aplicação, para que o serviço não altere o schema a cada reinicialização.

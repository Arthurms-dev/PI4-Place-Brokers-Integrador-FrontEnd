# Place Brokers — Frontend revisado

Projeto React 19 / Vite 7 / Tailwind CSS 4, mantido sem migração de stack.

## Para rodar

```bash
cp .env.example .env
npm ci
npm run dev
```

No Windows, copie manualmente `.env.example` para `.env` ou use `copy .env.example .env`.

Preencha as variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` quando necessário e configure `VITE_API_URL` apontando para o backend. Nunca coloque a chave de serviço do Supabase no frontend.

Execute `npm test` e `npm run build` antes de publicar. Consulte o relatório de auditoria para as dependências pendentes de banco/integração.

# Place Brokers — Design PRO

Esta versão inclui melhorias visuais no código-fonte real: site público, painel administrativo e áreas por perfil, preservando a paleta institucional azul-marinho/dourado e as integrações existentes.

## Execução

```bash
npm ci
npm run dev
npm run build
npm test
```

Copie `.env.example` para `.env` e configure `VITE_API_URL` para a URL do Backend ativo.

## Observações de entrega

As mudanças de estilo foram verificadas estaticamente (parse JSX, imports e cores). A execução no navegador e o build não puderam ser realizados aqui porque o npm não disponibilizou os pacotes. Antes da publicação, realize uma homologação com a API autenticada em 375px, 768px, 1366px e telas maiores.

O arquivo `PLACE_BROKERS_DESIGN_PRO_CHANGELOG.md` acompanha a entrega completa, e pode ser consultado separadamente.

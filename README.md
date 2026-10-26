# Place Brokers — Front-end (`place-frontend`)

Site público e painéis (admin, gerente e corretor) da plataforma imobiliária **Place Brokers**, Projeto Integrador 4 (PI4) do curso de Sistemas para Internet da Universidade Católica de Pernambuco.

**Equipe:** Arthur Vinícius, Gabriel Soares, João Victor Varela, Sérgio Bandeira da Cruz, Sofia Viana Perez

API: [PI4-Place-Brokers-Integrador-BackEnd](https://github.com/Arthurms-dev/PI4-Place-Brokers-Integrador-BackEnd)

## Stack

Vite · React 19 · React Router 7 · Tailwind CSS v4 · Leaflet (mapas) · Supabase JS · Vitest + Testing Library

## Como rodar

```bash
cd place-frontend
cp .env.example .env    # ou crie o .env com as variáveis abaixo
npm install
npm run dev             # http://localhost:5173
npm test                # testes (Vitest)
npm run build           # build de produção
```

| Variável | Para quê |
| --- | --- |
| `VITE_API_URL` | endereço da API (padrão `http://localhost:3333`) |
| `VITE_SUPABASE_URL` | URL do projeto no Supabase |
| `VITE_SUPABASE_ANON_KEY` | chave pública do Supabase (nunca use a service role aqui) |

A API precisa estar rodando para login e painéis funcionarem.

## Organização

```
src/
  App.jsx                 todas as rotas
  pages/                  telas (admin/, corretor/, gerente/, viabilizador/ e páginas públicas)
  components/             site/, admin/, auth/, map/, ui/ (design system)
  services/               chamadas à API, uma por recurso
  lib/                    utilitários (apiClient, areas, formatação, filtros, calendário...)
  hooks/                  useUsuarioAtual, useAsyncData, usePageTitle...
  styles/                 CSS extra (animações do dashboard, home, detalhe)
```

**Chamadas à API:** use `api` de `src/lib/apiClient.js` (já manda o token e padroniza os erros):

```js
import { api } from "@/lib/apiClient";
export const listarMeusLeads = async () => (await api.get("/leads/meus")).leads;
```

## Rotas

| Área | Rotas |
| --- | --- |
| Público | `/`, `/sobre`, `/contato`, `/login`, `/register`, `/acesso-negado` |
| Corretor `/corretor` | início, `empreendimentos`, `empreendimentos/:id`, `mapa`, `books`, `clientes/novo`, `leads`, `agenda`, `vendas`, `configuracoes` |
| Gerente `/gerente` | início, `empreendimentos`, `books`, `equipe`, `leads`, `agendamentos`, `vendas`, `configuracoes` |
| Admin `/admin` | `painel`, `dashboard`, `imoveis`, `leads`, `clientes`, `agendamentos`, `vendas`, `relatorios`, `equipe`, `configuracoes` |
| Viabilizador | bloqueado no MVP (redireciona para `/acesso-negado`) |

Os menus laterais de corretor, gerente e viabilizador ficam em `src/lib/areas.js`; o do admin em `src/pages/admin/AdminLayout.jsx`. Cada área usa o mesmo `AdminShell` e o `AreaLayout` confere se o cargo do usuário bate com a área.

## Quem fez o quê

| Parte | Responsáveis |
| --- | --- |
| Setup, design system, login/register, telas iniciais de leads, clientes e agendamentos do admin | Arthur Vinícius |
| Landing page | Gabriel Soares |
| Galeria de imóveis e formulários do site | Sérgio Bandeira |
| Painel administrativo com feeds | Sofia Viana |
| Área do corretor e do gerente, empreendimentos/documentos no admin, equipe, vendas/VGV, integração com a API | João Victor |

O andamento do projeto fica no quadro **Place-Brokers** do Trello.

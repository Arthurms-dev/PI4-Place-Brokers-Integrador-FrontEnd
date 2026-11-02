# Place Brokers — Front-end (`place-frontend`)

Site público e painéis (admin, gerente e corretor) da plataforma imobiliária **Place Brokers**, Projeto Integrador 4 (PI4) do curso de Sistemas para Internet da Universidade Católica de Pernambuco.

**Equipe:** Arthur Vinícius, Gabriel Soares, João Victor Varela, Sérgio Bandeira da Cruz, Sofia Viana Perez

API: [PI4-Place-Brokers-Integrador-BackEnd](https://github.com/Arthurms-dev/PI4-Place-Brokers-Integrador-BackEnd)

## Stack

Vite · React 19 · React Router 7 · Tailwind CSS v4 · Leaflet (mapas) · Sentry (erros) · Vitest + Testing Library. Funções da Vercel em `api/` (prévia de link, sitemap e robots).

O front não fala com o Supabase direto: tudo passa pela API.

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
| `VITE_SENTRY_DSN` | opcional: envia os erros do site para o Sentry |

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
| Público | `/`, `/imoveis/:id` (janela do empreendimento), `/sobre`, `/contato`, `/privacidade`, `/login`, `/register`, `/esqueci-senha`, `/redefinir-senha`, `/acesso-negado` |
| Corretor `/corretor` | início, `empreendimentos`, `empreendimentos/:id`, `mapa`, `books`, `clientes/novo`, `leads`, `agenda`, `vendas`, `configuracoes` |
| Gerente `/gerente` | início, `empreendimentos`, `books`, `equipe`, `leads`, `agendamentos`, `focos`, `vendas`, `configuracoes` |
| Admin `/admin` | `painel`, `dashboard`, `imoveis`, `leads`, `clientes`, `agendamentos`, `vendas`, `relatorios`, `equipe`, `roleta`, `focos`, `configuracoes` |
| Viabilizador | bloqueado no MVP (redireciona para `/acesso-negado`) |

Os menus laterais de corretor, gerente e viabilizador ficam em `src/lib/areas.js`; o do admin em `src/pages/admin/AdminLayout.jsx`. Cada área usa o mesmo `AdminShell` e o `AreaLayout` confere se o cargo do usuário bate com a área.

## SEO, prévia de link e LGPD

- **Google:** cada empreendimento tem endereço próprio (`/imoveis/:id`) e a página troca título, descrição e imagem ao abrir (`src/lib/seo.js`). `/sitemap.xml` e `/robots.txt` são gerados na hora pelas funções da Vercel em `api/` (as áreas internas ficam fora do Google).
- **WhatsApp, Instagram, Facebook:** o robô dessas redes não roda JavaScript. O `vercel.json` manda só esses robôs para `api/previa.js`, que devolve o nome, o preço e a foto (miniatura) do empreendimento. Gente de verdade recebe o site normal. Enquanto a API estiver no plano gratuito do Render (que "dorme"), a primeira prévia pode sair genérica; depois fica guardada por 1 dia.
- **Compartilhar pelo corretor:** no catálogo, "Enviar pelo WhatsApp" monta a mensagem com o link público (sem book nem tabela) e "Copiar link" copia só o endereço.
- **LGPD:** o formulário de contato pede a autorização (obrigatória) e pergunta à parte se a pessoa quer receber lançamentos. As duas respostas e a versão da política vão na mensagem do lead. A política fica em `/privacidade` (`src/pages/PrivacidadePage.jsx`); a Place deve revisar o texto com o jurídico e indicar o encarregado (DPO) antes de ir para o domínio oficial.
- **Fotos leves:** os cards usam a miniatura de 640 px da capa (`capa_miniatura_url`), gerada pela API no upload. Para as capas antigas, rode uma vez no back: `node scripts/gerar-miniaturas.cjs`.

- **CRECI e endereço:** o rodapé mostra o CRECI 18303-J e o endereço do escritório, como o COFECI exige em toda publicidade (Resolução 1.065/2007). Os dados ficam em `CONTATO`, no `SiteFooter.jsx`.
- **Pronto para morar:** a home tem uma vitrine própria para os imóveis prontos, onde depois também entram os usados. Os endereços antigos do WordPress (`/imoveis` e `/imoveis/nome-do-imovel/`) caem nessa lista, e `/fale-conosco` vai para `/contato`.
- **Usados e prontos fora do catálogo:** o cartão "Procura um usado ou pronto?" abre o formulário com o campo "O que você procura?". O lead chega como "Imóvel pronto ou usado", e na tela do corretor aparece o atalho para buscar no Pronto Pra Morar, o parceiro (`src/lib/prontosEUsados.js`). O site público não mostra o nome nem os imóveis do parceiro: anunciar imóvel de outra imobiliária pede autorização por escrito (Lei 6.530/78, art. 20, III).
- **Prova social:** a seção "Quem é a Place" (home) e a página Sobre usam só dados reais e conferíveis: nota no Google, Instagram, CRECI e vídeos do time. As capas ficam salvas em `src/assets/instagram/` e o clique abre o vídeo no Instagram, sem script do Instagram na página (sem cookies de terceiros). Para trocar, veja o comentário em `src/lib/provaSocial.js`. Depoimento ou foto de cliente só com autorização por escrito.
- **Sessão:** o login devolve um `refreshToken`. Quando o token de 1 hora vence, o `apiClient` renova sozinho em `POST /auth/renovar` e repete o pedido, sem tirar a pessoa da conta.

Variáveis opcionais na Vercel para as funções de `api/`: `API_URL` (padrão: a API do Render) e `SITE_URL` (padrão: o próprio domínio do pedido).

## Quem fez o quê

| Parte | Responsáveis |
| --- | --- |
| Setup, design system, login/register, telas iniciais de leads, clientes e agendamentos do admin | Arthur Vinícius |
| Landing page | Gabriel Soares |
| Galeria de imóveis e formulários do site | Sérgio Bandeira |
| Painel administrativo com feeds | Sofia Viana |
| Área do corretor e do gerente, empreendimentos/documentos no admin, equipe, vendas/VGV, roleta, integração com a API | João Victor |
| `apiClient` em todos os services, roteiro de entrega do AOS | Sérgio Bandeira |

O app do corretor (React Native + Expo) fica no repositório próprio `PI4-Place-Brokers-App`.

O andamento do projeto fica no quadro **Place-Brokers** do Trello.

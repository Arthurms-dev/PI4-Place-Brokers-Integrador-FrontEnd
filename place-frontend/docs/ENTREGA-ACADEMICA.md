# Place Brokers — acompanhamento da entrega acadêmica

Requisitos fornecidos por João em 25/10/2026. Esta matriz diferencia implementação encontrada, evidência ainda necessária e trabalho pendente. A revisão visual da home atende ao cliente real; não substitui as exigências de backend ou aplicativo.

## Prazos

| Entrega | Prazo informado | Apresentação |
| --- | --- | --- |
| Backend Express — 6,0 pontos | 29/11/2026, 23h59 | 30/11 ou 03/12/2026, por sorteio |
| Aplicativo — 6,0 pontos | 30/11/2026, 23h59 | 01 ou 04/12/2026, por sorteio; celular físico |

Todos precisam enviar no Teams e participar da apresentação. O enunciado prevê desconto individual de 1 ponto por não enviar ou não participar; a participação no desenvolvimento será verificada pelos commits. Os vídeos devem ter áudio e estar no YouTube, públicos ou não listados: até 3 minutos para backend e 4 minutos para aplicativo.

## Backend: evidência no código consultado

| Exigência | Evidência | Situação |
| --- | --- | --- |
| Express e PostgreSQL na nuvem | `src/app.js`, configuração Supabase e schema/migrações PostgreSQL | Código presente; disponibilidade do banco não testada nesta execução |
| Login e sign up | `POST /auth/login`, `POST /auth/register` | Implementados; cadastro tem aprovação |
| Logout no backend | Nenhuma rota de logout em `authRoutes.js`; frontend apenas chama `clearToken()` | Pendente: sair da interface não comprova encerramento de sessão pelo backend |
| CRUD completo de pelo menos 4 entidades | Há módulos de empreendimentos, clientes, agendamentos, leads e outros; nem todos têm DELETE e algumas atualizações são específicas de status | Não é possível afirmar atendimento; definir 4 entidades e completar as operações exigidas, preservando regras de negócio |
| 2 relacionamentos com URL composta | Existem `/leads/:id/atividades`, `/empreendimentos/:id/tipologias`, `/empreendimentos/:id/imagens` e documentos | URLs compostas existem; ainda é necessário escolher os 2 relacionamentos da apresentação e demonstrar as operações exigidas |
| Acesso ao backend após login, exceto login/sign up | Catálogo de empreendimentos usa autenticação opcional; construtoras tem GET público; captação de lead e eventos também são públicos; `/health` é público | Divergência com a redação literal do enunciado; não declarar conforme |
| Impedir alterações em dados de outro usuário | Middlewares de autenticação/perfil e regras de carteira em serviços; testes de autorização no repositório | Implementação presente; falta demonstração ponta a ponta com duas contas |
| README com nomes e RAs | Nenhum README localizado nos dois repositórios consultados | Pendente; obter RA real de cada integrante |
| Publicação Vercel conectada ao PostgreSQL | Nenhum `vercel.json` localizado; servidor atual usa `app.listen` | Não comprovada; conferir configuração efetiva e testar URL publicada |
| Collection Postman com variáveis | Nenhum arquivo de collection localizado nos repositórios consultados | Não comprovada; pode existir fora deles |
| 2 objetos de cada entidade e relacionamento | Schema enviado não contém registros | Não verificado; montar seed seguro e comprovar os registros |
| PDF e vídeo | Não apresentados nesta execução | Preparar após fechar e testar o escopo |

### Compatibilidade com o produto real

O portal da Place precisa mostrar imóveis e captar interesse sem obrigar o visitante a criar uma conta. O enunciado acadêmico restringe o backend a usuários autenticados, com exceções apenas para login e sign up. É necessário alinhar essa divergência com o professor antes de declarar cumprimento. Separar rotas públicas das rotas de gestão organiza o produto, mas **não elimina por si só** a divergência com a redação literal. Esta entrega não fecha o catálogo público nem altera permissões para tentar maquiar o requisito.

## Aplicativo Expo

Nos repositórios fornecidos foram localizados frontend React/Vite e backend Express. Não foi localizado projeto React Native/Expo neles. Isso não comprova que um app não exista em outro repositório.

Confirmar ou implementar no repositório mobile:

- Expo Router e estado global (por exemplo Zustand).
- Home e Sobre, além de no mínimo uma tela por integrante da equipe.
- Interações e UI Kit compatível com Expo.
- Axios e TanStack Query ou SWR para consumir a API Express.
- Login, logout, sign up e CRUD das quatro entidades e dois relacionamentos escolhidos.
- README com nomes/RAs e commits de contribuição real de todos.
- Publicação Expo/atualizações OTA sob a organização convidada, QR code validado em celular físico.
- Vídeo com áudio de até quatro minutos e PDF com requisitos atendidos/não atendidos e contribuições individuais.

## Ordem de trabalho proposta

1. Aplicar e avaliar a home/galeria com o cliente, usando acervo autorizado e características reais dos empreendimentos.
2. Fechar a matriz acadêmica: quatro entidades, dois relacionamentos e definição do tratamento das rotas públicas com o professor.
3. Implementar logout do backend e completar operações faltantes com testes de autorização.
4. Preparar Postman, registros de demonstração e deploy validado.
5. Confirmar o repositório mobile e construir/validar o app sobre os mesmos contratos da API.
6. Gravar vídeos, preparar os PDFs e conferir envio individual no Teams.

## Marca: limite da consulta ao Instagram

O perfil informado foi localizado em resultados públicos de busca, mas a abertura direta foi bloqueada/limitada pelo Instagram. Não foi possível validar visualmente o feed atual, amostrar suas cores ou afirmar que esta revisão reproduz a identidade atual do perfil. A implementação usa a marca já presente no repositório e os materiais oficiais acessíveis no Drive. A paleta permanece sujeita à revisão visual do cliente.

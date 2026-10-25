# Home e galeria — revisão de 25/10/2026

Base analisada: frontend `f487513328258437134a6122454fe362d19639a0` e backend `a7dd997` (main em 25/10/2026). Esta entrega altera o frontend; não executa SQL nem altera dados de produção.

## Diagnóstico e decisão

A abertura anterior usava uma mensagem ampla ("Encontre seu próximo lugar") e apresentava o catálogo em blocos semelhantes. Já o site em produção trabalha explicitamente a intenção de investir e morar e apresenta um imóvel com narrativa própria. A revisão aproxima a experiência da marca: descoberta fotográfica, localização e informações comerciais legíveis, acompanhadas por atendimento da Place.

A primeira entrega contém:

- Abertura clara com destaque fotográfico, caminhos "Quero morar" e "Quero investir" e escolha manual de empreendimento. O destaque não gira sozinho enquanto o visitante lê.
- Nome, localização, valor cadastrado e informações de quartos/área no destaque. Sem cálculo ou promessa de retorno financeiro.
- Coleções com fotografia do empreendimento usado como exemplo, filtros existentes e contagens reais do catálogo carregado.
- Galeria ampla acima das informações e formulário: mosaico adaptativo de uma a cinco fotos, acesso a todas as imagens, zoom, miniaturas, teclado e gesto horizontal no celular.
- Foco contido no visualizador, retorno ao botão de origem e Escape que fecha a galeria sem fechar o detalhe do imóvel.
- Tratamento de fotos indisponíveis, estado vazio e preferências de movimento reduzido.
- Metadados básicos da página orientados ao visitante.

Os contatos seguem pelo formulário existente. O caminho de investimento registra a origem `investimento na home`. Não foram adicionados telefone público, depoimentos, métricas comerciais ou preços sem cadastro.

## Material consultado

Fonte: [Drive da Place](https://drive.google.com/drive/folders/1YFvZRQ6P3pjp1hTgVzpd2kvlB55AQ3Ld).

Foram listadas as pastas Logo Place Brokers, Litoral, Alto Padrão, Médio Padrão e MCMV. Os metadados revelam atalhos de construtoras, mas a resposta da conexão não expõe `shortcutDetails.targetId`; isso não comprova acesso ou falta de acesso às pastas de destino. Não foi possível auditar todo o acervo das construtoras nesta revisão.

Pastas diretas conferidas:

- Bora!: pré-book Viva Paineiras, book Brisa do Mar e tabelas de outubro/2026 por fase.
- Casa Concreto: book Vale dos Guararapes e tabela de outubro/2026.

### Primeiro acervo visual aplicado

[Book Brisa do Mar](https://drive.google.com/file/d/1ps-E8ERrLSjviCS-4xjAe-vwAMvyUhff/view), 40 páginas, consultado em 25/10/2026.

| Arquivo WebP | Origem no PDF | Conteúdo |
| --- | --- | --- |
| fachada.webp | página 3 | Perspectiva da fachada |
| piscina.webp | página 10 | Perspectiva da piscina e deck |
| sala.webp | página 28 | Perspectiva da sala integrada |
| suite.webp | página 30 | Perspectiva da suíte |
| varanda.webp | página 29 | Perspectiva da varanda gourmet |

As cinco imagens foram extraídas dos objetos de imagem do PDF e convertidas para WebP, preservando a composição original. São perspectivas ilustradas, não fotos de obra pronta. As legendas explicitam essa condição. Não foram incluídos PDF integral, tabelas, plantas ou URLs autenticadas no código público.

O vínculo local exige o nome exato "Brisa do Mar" (normalizado apenas para caixa, acentuação e espaços). Não cria um imóvel ou altera seu estado de publicação. A capa cadastrada prevalece; a galeria cadastrada prevalece sobre o acervo alternativo. Ao carregar as imagens do detalhe, a galeria alternativa é substituída. Os demais empreendimentos continuam usando seu cadastro.

## Pendências por evidência

| Assunto | Situação constatada | Próxima ação |
| --- | --- | --- |
| Home e galeria | Implementação desta branch; revisão visual com cliente pendente | Conferir desktop, tablet e celular com catálogo real |
| Material das construtoras | Atalhos encontrados; destinos não retornados pela conexão | Resolver os destinos e selecionar imagens por empreendimento |
| Catálogo público | A listagem da API entrega capa; fotos adicionais vêm no detalhe | Completar galerias no ADM; avaliar preview no catálogo depois de medir o volume |
| Rotas do gerente | Rotas e menus já existem em main | Validar com conta gerente e dados reais; não reconstruir por checklist antigo |
| Recuperação de senha | Não localizado fluxo de recuperação nas telas/rotas consultadas | Implementar em etapa própria |
| Documentos comerciais | Backend já separa book/tabela do catálogo público | Manter acesso via fluxo interno autorizado |
| Produção | Sem teste ponta a ponta com banco nesta execução | Validar leads, permissões, Storage, SEO e desempenho antes da publicação |

O quadro acessível pela conexão era "Meu quadro do Trello", diferente do "Projeto-Place-Brokers" nas capturas enviadas. Os cartões daquele outro quadro não foram usados como diagnóstico do projeto nem alterados.

## Validação

Testes automatizados cobrem navegação, foco, Escape, limites da galeria, gesto horizontal, imagens quebradas, intenção de investimento, filtros e precedência das imagens cadastradas. Resultado: 68 testes aprovados, 4 TODO preexistentes, compilação de produção aprovada e `git diff --check` sem problemas. O patch também foi aplicado com sucesso em checkout limpo da base indicada.

A tentativa de criar uma branch remota recebeu HTTP 403 (`Resource not accessible by integration`). Nenhuma branch, PR ou alteração de main foi publicada por esta execução.

Limite desta execução: o navegador disponível não alcançou o servidor local, e o ambiente local não dispõe de Chromium funcional. Não há evidência de revisão visual em navegador, teste com Supabase ou publicação em produção. A branch é uma entrega para revisão, não uma homologação visual definitiva.

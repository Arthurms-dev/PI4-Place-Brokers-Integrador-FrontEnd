# Place Brokers — revisão dos repositórios

Data de referência: 25/10/2026 (Brasil).

## Versões conferidas

| Projeto | Branch de origem | Commit |
| --- | --- | --- |
| Front | `melhoria/home-galeria-place` | `1393dfc` |
| Back | `melhoria/drive-atalhos-3c` | `3490490` |

O commit `00cd458` com os textos de atualização do catálogo está no histórico do front. O acervo do ADM está em `270e77a`. A comparação descartada não está nessas versões. A branch `main` de cada repositório ainda não inclui essas branches de melhoria. Não confundir a versão de desenvolvimento com o código usado por um deploy: isso depende da configuração do serviço de hospedagem, não verificada aqui.

## Escopo e limites

Foram inventariados os 376 arquivos versionados: 249 no front e 127 no back. Os 306 arquivos JavaScript/JSX/CJS passaram por análise de sintaxe e referências estáticas, inclusive os arquivos fora do caminho principal do build. O CSV `INVENTARIO-REPOSITORIOS-20261025.csv` registra uma linha por arquivo, o nível de verificação e os achados. Os arquivos acrescentados por esta revisão não integram a contagem da base original.

Isso **não significa certificação funcional manual de todos os arquivos**. A leitura manual desta rodada se concentrou em home, seleção de capas, normalização do catálogo, galeria, cadastro de imagens, sessão, autenticação, permissões, documentos e criação/edição de empreendimentos. A triagem dos demais arquivos e os testes ajudam a orientar a revisão seguinte; não substituem testes com a sessão real de cada cargo.

Não houve gravação no Supabase, execução de migração, envio de leads, alteração de credenciais ou publicação em produção. Valores de configurações de ambiente não são reproduzidos neste relatório.

## Achados e primeiras correções

### 1. Mesmo imóvel ilustrando várias coleções — corrigido

Arquivo: `src/components/site/home/ExplorarRegioes.jsx`.

Cada categoria usava `itens.find(...)` de forma independente. Um imóvel barato com dois quartos em lançamento podia ser o primeiro exemplo das três categorias, reproduzindo a mesma capa. Isso explica a repetição vista no vídeo **na seção de coleções**, e não demonstra que os cadastros dos imóveis estejam duplicados.

A nova seleção prefere outro imóvel e outra URL de capa, respeitando os critérios de cada categoria. Contagens e filtros permanecem fiéis ao catálogo. Se só houver um exemplo verdadeiro, sua foto pode se repetir; não se usa a imagem de um empreendimento incompatível para completar a seção.

### 2. Nomes cortados e rolagem na abertura — ajustado

Arquivo: `src/styles/home.css`.

A faixa de destaques reservava espaço para uma chamada lateral, impunha largura fixa a cada miniatura e truncava os nomes em uma linha. Em telas largas, passa a distribuir os até cinco destaques no espaço disponível. Os nomes podem ocupar mais de uma linha. Em telas menores permanece a rolagem horizontal, com encaixe dos itens e barra mais discreta. O foco de teclado fica visível.

### 3. Localização truncada e seletor antigo de etiquetas — ajustados

Arquivos: `src/components/site/home/ListaEmpreendimentos.jsx` e `src/styles/home.css`.

O bairro e a cidade podem quebrar a linha. O estilo das etiquetas agora aponta para a classe realmente usada pelos cards (`pb-home-imovel`); antes usava a classe antiga `pb-property-card`.

### 4. Validação numérica do empreendimento — próxima correção de back

Arquivo: `src/services/empreendimentoService.js` no back.

`atualizar` verifica se os números são finitos, mas não impede faixa de preço/área/quartos/vagas invertida nem número negativo/fracionário em contagens. O front contém validações de intervalo, mas uma chamada direta à API pode passar por elas. `validar` na criação confere principalmente campos obrigatórios e status. Próximo passo: compartilhar regras entre criação e edição, considerando o registro atual em atualizações parciais, com testes que demonstrem rejeição antes de chamar o repositório/upload.

Não se alterou o back neste pacote. A rejeição efetiva desses casos no banco real depende também das constraints implantadas, não verificadas nesta rodada.

### 5. Upload antigo na criação ainda reutiliza caminhos — próximo passo de back

Arquivo: `src/services/uploadService.js` no back.

`uploadImagem`/`uploadGaleria` usam slug e nome fixo com `upsert: true`; `uploadImagemNova`, utilizado pelo editor do ADM, já cria caminho com UUID e `upsert: false`. O fluxo de criação também pode deixar arquivos órfãos se uma etapa posterior falhar. Próximo passo: unificar criação e edição em uploads únicos, com limpeza dos arquivos recém-criados em falha, sem apagar imagens de cadastros existentes.

### 6. Cliente Supabase legado sem dependência — limpeza pendente

Arquivo: `src/lib/supabase.js` no front.

Importa `@supabase/supabase-js`, que não está declarado no `package.json` do front. É referenciado por `src/services/leads.js`, serviço legado que insere diretamente no Supabase. Não foram encontradas chamadas a esse serviço nos componentes atuais; o formulário público usa `leadsPublico.js` e a API. Por isso esse caminho legado não bloqueia o build atual. Antes de removê-lo, revisar ambos os arquivos; não adicionar uma dependência apenas para sustentar código sem uso.

### 7. Curadoria ainda incompleta — depende dos arquivos originais

Arquivo: `src/data/midiasPublicasVerificadas.js` e registro das fontes em `src/data/fontesGaleriaPublica.json`.

O acervo local cobre Brisa do Mar, Engenho Paulista, Carneiros Park e Porto Carolina. Parque dos Coqueiros aparece no vídeo com legendas e grafismos. Não basta trocar a função de seleção de fotos: é necessário conferir os originais da pasta de imagens e atualizar o cadastro correspondente. A revisão não remove textos de fotos nem troca capas do banco automaticamente.

### 8. Cidades, contato e acessibilidade — rodada seguinte

`Cidades.jsx` representa cidades pela primeira capa de imóvel encontrada, explicando a semelhança com o catálogo. Fotografias de destinos precisam ter origem conferida. `ContatoProvider.jsx` repete a chamada de contato já presente em outras seções. Os modais de contato e detalhe têm Escape e bloqueio de rolagem, mas o tratamento completo de foco deve ser verificado como já ocorre na galeria. Priorizar navegação por teclado e celular antes de acrescentar funções.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| Front antes da alteração | 93 testes passaram; 4 todo |
| Front depois da alteração | 98 testes passaram; 4 todo |
| Build de produção do front | Passou |
| Back — Jest | 260 testes passaram; 5 todo |
| Back — scripts Drive | 57 testes passaram |
| Sintaxe dos 306 fontes da base | Sem erros de sintaxe encontrados |
| Referências locais dos fontes da base | Nenhum caminho ausente detectado |
| Dependências declaradas | Exceção no módulo legado Supabase do front, descrita acima |

Os cinco testes novos cobrem diversidade de imóvel e URL, preservação das contagens, fallback verdadeiro quando faltam alternativas, categorias sem foto/vazias e aplicação do filtro. Os testes existentes do acervo, galeria e autenticação permaneceram passando.

Foi tentada uma conferência visual automatizada com Playwright, mas este ambiente não dispõe do executável Chromium. Portanto, a aparência final em desktop e celular **ainda precisa de validação no navegador**. Build e testes DOM não comprovam o layout final.

## Ordem dos próximos passos

1. Instalar e conferir esta correção pequena da home no navegador.
2. Corrigir validação de faixas na API e o fluxo antigo de upload, em alteração separada.
3. Curar Parque dos Coqueiros e os empreendimentos restantes a partir das pastas de imagens, evitando fotos com arte.
4. Rever representação de cidades e acessibilidade dos modais.
5. Consolidar branches e conferir qual branch cada hospedagem publica.

Não reintroduzir comparação de empreendimentos nesta sequência.

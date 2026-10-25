# Acervo de imagens no cadastro do ADM

Esta entrega acrescenta escolha de fotos do acervo conferido ao editor de
imagens existente. Depende dos pacotes Galeria Acervo e Galeria Limpa já
instalados. Não inclui outra cópia das imagens e não exige SQL ou mudança
de backend. As operações usam as rotas autenticadas de imagens já existentes.

## Uso

1. Entrar como ADM, abrir Empreendimentos e editar um empreendimento existente.
2. Em Capa e galeria de fotos, abrir Escolher fotos do acervo Place.
3. Conferir as miniaturas e clicar em Usar como capa na foto desejada.
4. Marcar até cinco outras fotos e clicar em Adicionar fotos selecionadas.
5. Conferir a galeria atual e remover manualmente imagens antigas ou repetidas
   que não devam continuar na seleção. As adições não removem arquivos atuais.
6. Reabrir os detalhes no site público para conferir a seleção final.

A capa é salva imediatamente pelo seu botão; não precisa do botão geral de
salvar as características. Adicionar fotos também é uma gravação independente.
Em empreendimento publicado, as fotos salvas podem aparecer no site público.

O seletor está disponível para Engenho Paulista, Carneiros Park e Porto Carolina,
pelos nomes normalizados exatos. Não associa por prefixo ou nome parecido.
Os outros empreendimentos mantêm o upload manual. Brisa do Mar não foi incluído
neste seletor: o lote atual de pastas de imagens foi conferido para os três
empreendimentos acima. O acervo público anterior de Brisa permanece preservado.

## Comportamento e limites

- As prévias vêm do acervo local conferido, sem arte publicitária sobreposta.
  Este seletor não consulta nem sincroniza o Drive ao ser aberto.
- Abrir a seleção ou marcar fotos não grava nada. Só os botões de capa e
  adicionar iniciam o upload para o empreendimento autenticado.
- A foto usada como capa nesta edição não é incluída simultaneamente na
  seleção de galeria. Fotos já enviadas nesta edição ficam marcadas.
- Essa memória vale enquanto o editor está aberto. Não há deduplicação de
  conteúdo entre sessões; conferir a galeria atual antes de adicionar de novo.
- A ordem de envio acompanha a curadoria, não a ordem dos cliques.
- Limites preservados: cinco fotos por envio, vinte na galeria e 15 MB por foto.
- Todas as imagens selecionadas são carregadas e validadas antes de iniciar
  o envio do lote. A leitura do arquivo local tem prazo de quinze segundos.
- Se o upload funcionar e a leitura seguinte falhar, a tela informa que a
  gravação ocorreu e bloqueia novos envios até Recarregar fotos funcionar.
  Recarregar apenas consulta o cadastro; não repete o upload.
- As legendas do acervo são mostradas na seleção. O backend continua com
  seu contrato de upload de arquivos; esta entrega não adiciona persistência
  automática das legendas da curadoria aos registros das fotos.
- Continua sendo possível escolher arquivos locais pelos controles anteriores.

## Verificação

Os testes cobrem escolha exata do empreendimento, origem válida de arquivo,
respostas inválidas, capa separada de galeria, limites, ordem, preservação das
fotos existentes e a recuperação depois de uma gravação seguida de falha de
consulta. Validar também com sessão real do ADM e no navegador do projeto.

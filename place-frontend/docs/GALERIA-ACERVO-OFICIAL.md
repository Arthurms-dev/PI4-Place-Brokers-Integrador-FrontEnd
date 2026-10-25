# Galeria — acervo oficial, lote 2

Implementado após a revisão do Drive no ADM. Este lote acrescenta 17 imagens
locais, sem alterar o banco ou a aprovação de documentos comerciais.

| Nome exato do catálogo | Imagens novas | Ordem |
|---|---:|---|
| Engenho Paulista | 6 | fachada, piscina, rooftop, cozinha, coworking, pet place |
| Carneiros Park | 5 | fachada, rooftop, studio, quarto, circulação |
| Porto Carolina | 6 | fachada, piscina, área social, deck, garden, área central |

Brisa do Mar mantém as cinco imagens do lote anterior. São 22 imagens de acervo
verificado disponíveis para quatro nomes de empreendimentos no catálogo.

## Origem e conferência

A seleção final prioriza arquivos soltos das pastas de imagens do Drive.
Engenho Paulista: IMG_8770.PNG (fachada), IMG_8767.PNG (cozinha), além dos
arquivos limpos de piscina, rooftop, coworking e pet place. Os nomes genéricos
foram conferidos visualmente com o book como referência de identidade.
Carneiros Park utiliza as cinco versões JPEG sem logotipo sobreposto da pasta
IMAGENS RENDERIZADAS. Porto Carolina mantém seis renders limpos da pasta
Imagens e Vídeos. Plantas e fotos de evolução da obra não fazem parte do lote.

src/data/fontesGaleriaPublica.json registra IDs, links, dimensões e hashes dos
originais usados. A documentação não é importada pelo aplicativo em execução.
Não foram apagados logotipos de imagens: foram escolhidas outras versões
originais disponíveis no acervo. Todas permanecem perspectivas ilustradas.

## Comportamento

O acervo é escolhido apenas pelo nome normalizado exato do empreendimento;
não se aplica por semelhança, prefixo ou nome de construtora. Um nome com
sufixo II, por exemplo, não recebe as imagens do empreendimento original.

Quando a API já possui imagens públicas cadastradas para o empreendimento,
elas continuam tendo prioridade: não se mistura esse acervo alternativo à
seleção do ADM. A capa cadastrada também é preservada. Se o acervo novo não
aparecer, confira primeiro se já existe uma galeria cadastrada na API.

Os mosaicos, miniaturas, tela cheia, zoom, teclado e navegação por toque já
existentes passam a usar essas imagens quando a galeria da API estiver vazia.
Os cards continuam com a capa da API quando disponível.

As legendas identificam todas as novas imagens como perspectivas ilustradas.
Imagens de uma tipologia ou unidade não comprovam que todas as unidades têm
os mesmos espaços, orientação ou vista. Nenhum preço, prazo ou retorno de
investimento foi calculado ou alterado por este lote.

## Entrega e verificação

As 17 imagens foram convertidas para WebP, preservando proporção e conteúdo,
com lado máximo de 1.600 px. Total aproximado: 3,82 MB, sem baixar todos os
arquivos na abertura de uma única galeria. A galeria mantém carregamento
adiado das imagens secundárias. Os originais não são incluídos na entrega.

Validar com o backend rodando e VITE_DEMO_MODE=false. Abrir os detalhes dos
três empreendimentos e conferir imagens, legendas, navegação e visual móvel.
Os testes automatizados verificam a associação exata, as contagens e a
prioridade das imagens do ADM. A conferência visual foi feita nas imagens de
origem; inspeção da tela renderizada no navegador ainda deve ser feita no
ambiente do projeto.

## Ajuste solicitado após a conferência visual

Priorizar os arquivos soltos das pastas IMAGENS / IMAGENS RENDERIZADAS /
Imagens e Vídeos. Não usar páginas de book com arte, títulos, chamadas
comerciais ou logotipos sobrepostos. Não remover marcas por edição: selecionar
a versão original limpa, quando houver.

A fachada de Engenho Paulista foi substituída por IMG_8770.PNG, e a sala com
arte do book deu lugar à cozinha IMG_8767.PNG. As cinco imagens de Carneiros
Park foram substituídas pelas versões JPEG sem o logotipo sobreposto.
As demais imagens deste lote foram mantidas após conferência visual.
O arquivo antigo sala.webp de Engenho Paulista deixou de ser importado.

A captura enviada mostra quatro fotos em Engenho Paulista, em vez das seis do
acervo alternativo. Isso indica provável galeria da API com prioridade. Atualizar
assets locais não substitui os arquivos já enviados pelo ADM: atualizar capa e
fotos no cadastro do empreendimento para aplicar a curadoria naquela seleção.

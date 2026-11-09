// Prova social do site: só dados reais e conferíveis da própria Place.
// Fontes (conferidas em 02/11/2026 no Instagram @placebrokers.imobiliaria):
// - bio, seguidores, posts e reels (VGV do semestre, aniversário de 3 anos);
// - destaques "Premiações" (prêmios das construtoras) e "Clientes" (sonhos realizados);
// - nota no Google do perfil da empresa (link do mapa no rodapé).
// Nada de depoimento inventado. Fotos de clientes: só as que a Place já publicou com autorização,
// nunca com criança. Se um cliente pedir para sair do site, é só tirar da lista SONHOS_REALIZADOS.
// Frases como "maior imobiliária do Nordeste" ficam de fora até existir um dado público que comprove.
//
// Para trocar uma imagem: salve em src/assets/instagram/ (.webp, quadrada para prêmios e clientes,
// 360x640 para os vídeos), ajuste a lista abaixo e o mapa de imports em components/site/home/ProvaSocial.jsx.

export const PERFIL_INSTAGRAM = {
  usuario: "placebrokers.imobiliaria",
  url: "https://www.instagram.com/placebrokers.imobiliaria/",
};

export const MAPA_GOOGLE = "https://maps.app.goo.gl/AwEPzwRm4A9bqAHNA";

const ID_DO_POST = /^[A-Za-z0-9_-]{6,20}$/;

/** Link de um post ou vídeo no perfil da Place (nunca de outro perfil). */
export function linkDoVideo(id, tipo = "reel") {
  if (!ID_DO_POST.test(String(id))) throw new Error(`Código de post inválido: ${id}`);
  return `${PERFIL_INSTAGRAM.url}${tipo === "p" ? "p" : "reel"}/${id}/`;
}

/** Destaques do perfil (stories fixos). */
export const DESTAQUES = {
  premiacoes: "https://www.instagram.com/stories/highlights/18067075897839572/",
  clientes: "https://www.instagram.com/stories/highlights/18005173061771484/",
};

/** Números arredondados para baixo: continuam verdadeiros enquanto a Place cresce. */
export const NUMEROS_DA_PLACE = [
  { id: "vgv", contar: true, valor: "R$ 142 mi", rotulo: "em vendas no 1º semestre de 2026", link: linkDoVideo("DbWohBrAmEO") },
  { id: "google", valor: "4,9", rotulo: "de nota no Google", link: MAPA_GOOGLE, estrela: true },
  { id: "instagram", contar: true, valor: "+20 mil", rotulo: "seguidores no Instagram", link: PERFIL_INSTAGRAM.url },
  { id: "creci", valor: "CRECI 18303-J", rotulo: "imobiliária registrada, desde 2023" },
];

/** Prêmios dados por construtoras parceiras (destaque "Premiações"). */
export const PREMIACOES = [
  { id: "carrilho-2025", imagem: "premio-carrilho-melhores-2025", construtora: "Carrilho", titulo: "Imobiliária destaque do ano (3º lugar)", quando: "Melhores do Ano 2025" },
  { id: "carrilho-abril-2025", imagem: "premio-carrilho-abril-2025", construtora: "Carrilho", titulo: "1º lugar em vendas", quando: "Abril de 2025" },
  { id: "bora-abril-2025", imagem: "premio-bora-abril-2025", construtora: "Bora Incorporadora", titulo: "2º lugar entre as imobiliárias", quando: "Abril de 2025" },
  { id: "maxplural-2024", imagem: "premio-maxplural-2024", construtora: "MaxPlural", titulo: "3º lugar entre as imobiliárias", quando: "Ano de 2024" },
];

/** Clientes com o "Meu sonho realizado" (destaque "Clientes"). Sem fotos com criança. */
export const SONHOS_REALIZADOS = [
  { id: "janga-garden", imagem: "cliente-janga-garden", legenda: "Lançamento do Janga Garden" },
  { id: "sonho-realizado", imagem: "cliente-sonho-realizado", legenda: "Mais um sonho realizado" },
  { id: "emily-mateus", imagem: "cliente-emily-mateus", legenda: "Emily e Mateus" },
  { id: "familia-contrato", imagem: "cliente-familia-contrato", legenda: "Contrato assinado" },
  { id: "e-venda", imagem: "cliente-e-venda", legenda: "É venda!" },
  { id: "chave-place", imagem: "cliente-chave-place", legenda: "Chave na mão" },
];

/** Vídeo em que clientes contam como foi comprar com a Place. */
export const DEPOIMENTOS = linkDoVideo("DYUudAMA7pZ");

/** Vídeos do time no Instagram (capa salva no site; o clique abre o vídeo no Instagram). */
export const VIDEOS_DO_INSTAGRAM = [
  { id: "DexRVXBBuDj", capa: "time-meta-do-mes", legenda: "O time da Place reunido para bater a meta do mês" },
  { id: "DfF7E5fhhQN", capa: "papo-de-imovel", legenda: "Papo de imóvel: sem complicação" },
  { id: "Dez5kVZBYpO", capa: "perto-do-mar", legenda: "Perto do mar e longe do comum" },
  { id: "De-MwedhKSd", capa: "pedido-especial", legenda: "Um pedido especial" },
  { id: "DerhjXwxVPR", capa: "caruaru", legenda: "Caruaru e um novo jeito para você morar" },
  { id: "De2XggthflK", capa: "maquina-de-vendas", legenda: "Bastidores: um dia de corretor na Place" },
];

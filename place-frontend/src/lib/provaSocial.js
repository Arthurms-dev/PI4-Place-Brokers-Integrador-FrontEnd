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
  { id: "google", contar: true, valor: "4,9", rotulo: "de nota no Google", link: MAPA_GOOGLE, estrela: true },
  { id: "instagram", contar: true, valor: "+20 mil", rotulo: "seguidores no Instagram", link: PERFIL_INSTAGRAM.url },
  { id: "creci", valor: "CRECI 18303-J", rotulo: "imobiliária registrada, desde 2023" },
];

/** Prêmios dados por construtoras parceiras (destaque "Premiações"). */
export const PREMIACOES = [
  { id: "carrilho-agosto-2026", imagem: "premio-carrilho-agosto-2026", construtora: "Carrilho", titulo: "Destaque em vendas, imobiliária parceira", quando: "Agosto de 2026" },
  { id: "carrilho-2025", imagem: "premio-carrilho-melhores-2025", construtora: "Carrilho", titulo: "Imobiliária destaque do ano (3º lugar)", quando: "Melhores do Ano 2025" },
  { id: "carrilho-abril-2025", imagem: "premio-carrilho-abril-2025", construtora: "Carrilho", titulo: "1º lugar em vendas", quando: "Abril de 2025" },
  { id: "bora-abril-2025", imagem: "premio-bora-abril-2025", construtora: "Bora Incorporadora", titulo: "2º lugar entre as imobiliárias", quando: "Abril de 2025" },
  { id: "maxplural-2024", imagem: "premio-maxplural-2024", construtora: "MaxPlural", titulo: "3º lugar entre as imobiliárias", quando: "Ano de 2024" },
];

/** Clientes no dia da compra (fotos da Place). Sem fotos com criança. */
export const SONHOS_REALIZADOS = [
  { id: "chave-houly", imagem: "cliente-chave-houly", legenda: "Chave na mão no escritório" },
  { id: "familia-sonho", imagem: "cliente-familia-sonho", legenda: "Mais que um imóvel, um sonho realizado" },
  { id: "chave-place", imagem: "cliente-chave-place", legenda: "Mais um sonho realizado com a Place" },
  { id: "carrilho", imagem: "cliente-carrilho", legenda: "Chave da Carrilho" },
  { id: "feirao", imagem: "cliente-feirao", legenda: "Venda no feirão Minha Casa Minha Vida" },
  { id: "casal", imagem: "cliente-casal", legenda: "Casal com a chave do novo lar" },
  { id: "usina", imagem: "cliente-usina", legenda: "Chave da Usina de Obras no feirão" },
  { id: "casa-concreto", imagem: "cliente-casa-concreto", legenda: "Chave da Casa Concreto" },
  { id: "houly-trio", imagem: "cliente-houly-trio", legenda: "Mais um sonho realizado no escritório" },
  { id: "houly-entrada", imagem: "cliente-houly-entrada", legenda: "Cliente com o time na entrada da Place" },
  { id: "feira", imagem: "cliente-feira", legenda: "Venda fechada na rua, com a chave da Place" },
  { id: "place-quatro", imagem: "cliente-place-quatro", legenda: "Mais um sonho realizado com a Place" },
];

/** Vídeo em que clientes contam como foi comprar com a Place. */
export const DEPOIMENTOS = linkDoVideo("DYUudAMA7pZ");

/** Vídeo da família chegando para receber as chaves. */
export const VIDEO_FAMILIA = { url: "https://www.instagram.com/reel/DfLroCWNpo-/", capa: "video-familia-feliz", legenda: "Mais uma família feliz com o seu sonho realizado" };

/** O time no dia a dia (fotos da Place). */
export const DIA_A_DIA = [
  { id: "festa", imagem: "dia-festa-time", legenda: "Time reunido no escritório" },
  { id: "atendimento", imagem: "dia-atendimento", legenda: "Atendimento na sala de reunião" },
  { id: "maquete", imagem: "dia-maquete", legenda: "Corretor apresentando a maquete ao cliente" },
  { id: "plantao", imagem: "dia-plantao", legenda: "Plantão de vendas no estande" },
  { id: "escritorio", imagem: "dia-escritorio", legenda: "Corretores trabalhando no escritório" },
  { id: "selfie", imagem: "dia-selfie-time", legenda: "Comemoração do time" },
];

// Prova social do site: só dados reais e conferíveis da própria Place.
// Fontes (conferidas em 02/11/2026):
// - Instagram @placebrokers.imobiliaria (bio, seguidores e vídeos do time);
// - nota no Google do perfil da empresa (link do mapa no rodapé).
// Nada de depoimento inventado. Foto ou fala de cliente só com autorização por escrito (LGPD).
//
// Para trocar os vídeos: salve a capa (360x640, .webp) em src/assets/instagram/
// e ajuste a lista abaixo e o import em components/site/home/ProvaSocial.jsx.

export const PERFIL_INSTAGRAM = {
  usuario: "placebrokers.imobiliaria",
  url: "https://www.instagram.com/placebrokers.imobiliaria/",
};

export const MAPA_GOOGLE = "https://maps.app.goo.gl/AwEPzwRm4A9bqAHNA";

/** Números arredondados para baixo: continuam verdadeiros enquanto o perfil cresce. */
export const NUMEROS_DA_PLACE = [
  { id: "google", valor: "4,9", rotulo: "de nota no Google", link: MAPA_GOOGLE, estrela: true },
  { id: "instagram", valor: "+20 mil", rotulo: "seguidores no Instagram", link: PERFIL_INSTAGRAM.url },
  { id: "creci", valor: "CRECI 18303-J", rotulo: "imobiliária registrada" },
  { id: "atuacao", valor: "Recife a Caruaru", rotulo: "Região Metropolitana, interior e litoral" },
];

/** Vídeos do time no Instagram (capa salva no site; o clique abre o vídeo no Instagram). */
export const VIDEOS_DO_INSTAGRAM = [
  { id: "DexRVXBBuDj", capa: "time-meta-do-mes", legenda: "O time da Place reunido para bater a meta do mês" },
  { id: "DfF7E5fhhQN", capa: "papo-de-imovel", legenda: "Papo de imóvel: sem complicação" },
  { id: "Dez5kVZBYpO", capa: "perto-do-mar", legenda: "Perto do mar e longe do comum" },
  { id: "De-MwedhKSd", capa: "pedido-especial", legenda: "Um pedido especial" },
  { id: "DerhjXwxVPR", capa: "caruaru", legenda: "Caruaru e um novo jeito para você morar" },
  { id: "De2XggthflK", capa: "maquina-de-vendas", legenda: "Bastidores: um dia de corretor na Place" },
];

const ID_DO_POST = /^[A-Za-z0-9_-]{6,20}$/;

/** Link do vídeo no perfil da Place (nunca de outro perfil). */
export function linkDoVideo(id) {
  if (!ID_DO_POST.test(String(id))) throw new Error(`Código de vídeo inválido: ${id}`);
  return `${PERFIL_INSTAGRAM.url}reel/${id}/`;
}

// "Quero vender meu imóvel": o dono conta como é o imóvel e vira lead de captação.
//
// Não tem upload de fotos pelo público (evita arquivo de estranho no nosso storage).
// O corretor liga, agenda a avaliação e, se a Place pegar o imóvel, o admin cadastra
// no painel como "Pronto" e ele aparece na página /prontos.

/** "Empreendimento" do formulário para esse pedido (não existe no banco). */
export const VENDER_IMOVEL = Object.freeze({
  id: "vender-imovel",
  title: "Quero vender meu imóvel",
  chamada: "Conte como é o seu imóvel. Um corretor da Place liga para combinar a avaliação, sem compromisso.",
});

export const CANAL_VENDA = "página prontos e seminovos";

export const TIPOS_IMOVEL = ["Apartamento", "Casa", "Casa em condomínio", "Sala comercial", "Terreno"];
export const SITUACOES_IMOVEL = ["Quitado", "Financiado", "Na planta (repasse)"];
export const LIMITE_OBSERVACOES = 300;

const limpar = (v, max = 80) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/**
 * Linha que vai na mensagem do lead com o resumo do imóvel.
 * @param {{ tipo?: string, local?: string, quartos?: string|number, area?: string|number, valor?: string, situacao?: string, observacoes?: string }} dados
 */
export function linhaDoImovel({ tipo, local, quartos, area, valor, situacao, observacoes } = {}) {
  const q = Number(quartos);
  const a = Number(String(area ?? "").replace(",", "."));
  const partes = [
    limpar(tipo, 40),
    limpar(local),
    q > 0 ? `${q} ${q === 1 ? "quarto" : "quartos"}` : "",
    a > 0 ? `${Math.round(a)} m²` : "",
    limpar(valor, 40) ? `quer ${limpar(valor, 40)}` : "",
    limpar(situacao, 40),
  ].filter(Boolean);
  const obs = limpar(observacoes, LIMITE_OBSERVACOES);
  if (!partes.length && !obs) return "";
  return `Imóvel para vender: ${partes.join(" · ") || "sem detalhes"}${obs ? `\nObservações: ${obs}` : ""}`;
}

/** O lead quer vender um imóvel? (lê a mensagem montada em services/leadsPublico.js) */
export function querVenderImovel(mensagem = "") {
  return String(mensagem ?? "").startsWith(`Interesse em: ${VENDER_IMOVEL.title}`);
}

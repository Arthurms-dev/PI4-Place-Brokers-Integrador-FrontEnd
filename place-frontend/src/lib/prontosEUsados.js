// Prontos e usados que ainda não estão no catálogo.
//
// O cliente pede pelo site e o corretor da Place procura na carteira dos parceiros
// (hoje o Pronto Pra Morar, site de prontos da Nogueira).
// O link do parceiro aparece só na área do corretor: o site público não anuncia imóvel
// de outra imobiliária sem autorização por escrito (Lei 6.530/78, art. 20, III).

/** "Empreendimento" do formulário de contato para esse pedido (não existe no banco). */
export const BUSCA_PRONTOS_E_USADOS = Object.freeze({
  id: "prontos-e-usados",
  title: "Imóvel pronto ou usado",
  chamada: "Conte o que procura. Um corretor busca imóveis prontos e usados com as imobiliárias parceiras e volta com opções.",
  pedirDetalhes: true,
});

export const CANAL_PRONTOS_E_USADOS = "prontos e usados";

export const PARCEIRO_PRONTOS = Object.freeze({
  nome: "Pronto Pra Morar",
  url: "https://meuprontopramorar.com.br/",
});

export const LIMITE_DETALHES = 300;

/** Linha que vai na mensagem do lead com o que o cliente procura. */
export function linhaDoPedido(detalhes = "") {
  const texto = String(detalhes).replace(/\s+/g, " ").trim().slice(0, LIMITE_DETALHES);
  return texto ? `Procura: ${texto}` : "";
}

/** O lead veio do pedido de pronto/usado? (lê a mensagem montada em services/leadsPublico.js) */
export function pedeProntoOuUsado(mensagem = "") {
  return String(mensagem ?? "").startsWith(`Interesse em: ${BUSCA_PRONTOS_E_USADOS.title}`);
}

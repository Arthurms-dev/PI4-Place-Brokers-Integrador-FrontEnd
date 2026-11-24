import { api } from "@/lib/apiClient";
import { VERSAO_POLITICA } from "@/lib/consentimento";

export const AREAS = [
  ["corretor", "Corretor(a) de imóveis"],
  ["captacao", "Captação de imóveis"],
  ["administrativo", "Administrativo"],
  ["marketing", "Marketing"],
  ["outra", "Outra área"],
];
export const NOME_DA_AREA = Object.fromEntries(AREAS);
export const UNIDADES = ["Recife", "Caruaru", "Paulista"];
export const NOME_DO_VINCULO = { autonomo: "Autônomo", clt: "CLT", estagio: "Estágio" };
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Hoje no horário de Recife (AAAA-MM-DD), para comparar com o prazo da vaga. */
export const hojeRecife = () => new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
export const diaMes = (iso) => `${Number(iso.slice(8, 10))} ${MESES[Number(iso.slice(5, 7)) - 1]}`;
export const diasAte = (iso, hoje = hojeRecife()) => Math.round((new Date(`${iso}T12:00:00Z`) - new Date(`${hoje}T12:00:00Z`)) / 86400000);

/** Requisitos digitados pelo RH (um por linha ou separados por ";") viram itens de lista. */
export const itensDosRequisitos = (texto) =>
  (texto ?? "").split(/\n|;/).map((r) => r.replace(/^\s*[-•*]\s*/, "").trim()).filter(Boolean);

/** Prazo mais próximo primeiro; vagas sem prazo no fim. */
export const ordenarVagas = (vagas) => [...vagas].sort((a, b) => (a.prazo ?? "9999") < (b.prazo ?? "9999") ? -1 : (a.prazo ?? "9999") > (b.prazo ?? "9999") ? 1 : 0);

/** Chips da vaga: vínculo, quantidade e prazo (o prazo avisa quando faltam 7 dias ou menos). */
export function detalhesDaVaga(v, hoje = hojeRecife()) {
  const chips = [];
  if (v.vinculo && NOME_DO_VINCULO[v.vinculo]) chips.push({ texto: NOME_DO_VINCULO[v.vinculo] });
  if (v.quantidade) chips.push({ texto: `${v.quantidade} ${Number(v.quantidade) === 1 ? "vaga" : "vagas"}` });
  if (v.prazo) {
    const faltam = diasAte(v.prazo, hoje);
    chips.push(
      faltam <= 0 ? { texto: "Último dia: inscrições até hoje", urgente: true }
        : faltam <= 7 ? { texto: `Últimos dias · até ${diaMes(v.prazo)}`, urgente: true }
          : { texto: `Inscrições até ${diaMes(v.prazo)}` },
    );
  }
  return chips;
}
export const LIMITE_CURRICULO = 5 * 1024 * 1024;

export const STATUS_CANDIDATURA = [
  ["novo", "Novo", "ouro"],
  ["em_analise", "Em análise", "azul"],
  ["entrevista", "Entrevista", "alerta"],
  ["aprovado", "Aprovado", "ok"],
  ["recusado", "Recusado", "perigo"],
];

// Site público
export const listarVagasAbertas = async () => (await api.get("/trabalhe-conosco/vagas", { auth: false })).vagas;

/** @param {Record<string, string|boolean>} campos @param {File|null} curriculo */
export async function enviarCandidatura(campos, curriculo) {
  const corpo = new FormData();
  for (const [chave, valor] of Object.entries(campos)) {
    if (valor !== undefined && valor !== null && valor !== "") corpo.append(chave, String(valor));
  }
  corpo.append("consentimentoVersao", VERSAO_POLITICA);
  if (curriculo) corpo.append("curriculo", curriculo);
  return (await api.post("/trabalhe-conosco/candidaturas", corpo, { auth: false })).candidatura;
}

// Painel do RH
export async function listarCandidaturas(filtros = {}) {
  const q = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v)).toString();
  return (await api.get(`/rh/candidaturas${q ? `?${q}` : ""}`)).candidaturas;
}
// Avisa o menu para recontar as candidaturas novas depois de mudar ou apagar uma.
export const CANDIDATURAS_MUDARAM = "placebrokers:candidaturas";
const avisarMudanca = () => window.dispatchEvent(new Event(CANDIDATURAS_MUDARAM));

/** @returns {Promise<number>} candidaturas com status "novo" */
export const contarCandidaturasNovas = async () => Number((await api.get("/rh/candidaturas/resumo")).novas) || 0;
export async function atualizarCandidatura(id, dados) {
  const { candidatura } = await api.patch(`/rh/candidaturas/${encodeURIComponent(id)}`, dados);
  avisarMudanca();
  return candidatura;
}
export async function apagarCandidatura(id) {
  await api.delete(`/rh/candidaturas/${encodeURIComponent(id)}`);
  avisarMudanca();
}
export const linkDoCurriculo = async (id) => (await api.get(`/rh/candidaturas/${encodeURIComponent(id)}/curriculo`)).url;
export const listarVagas = async () => (await api.get("/rh/vagas")).vagas;
export const criarVaga = async (dados) => (await api.post("/rh/vagas", dados)).vaga;
export const atualizarVaga = async (id, dados) => (await api.patch(`/rh/vagas/${encodeURIComponent(id)}`, dados)).vaga;

/** Link do WhatsApp com a mensagem pronta (aprovado como corretor recebe o link de cadastro). */
export function whatsappDoCandidato(c, origem = typeof window !== "undefined" ? window.location.origin : "") {
  const primeiroNome = (c.nome ?? "").trim().split(/\s+/)[0] ?? "";
  const texto = c.area === "corretor" && c.status === "aprovado"
    ? `Olá, ${primeiroNome}! Aqui é do RH da Place Brokers. Seu cadastro como corretor foi aprovado. Para entrar na plataforma, crie seu acesso em ${origem}/register`
    : `Olá, ${primeiroNome}! Aqui é do RH da Place Brokers, sobre a sua candidatura.`;
  return `https://wa.me/55${String(c.telefone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
}

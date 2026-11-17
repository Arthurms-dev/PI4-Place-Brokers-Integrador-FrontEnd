import { api } from "@/lib/apiClient";
import { VERSAO_POLITICA } from "@/lib/consentimento";

export const AREAS = [
  ["corretor", "Corretor(a) de imóveis"],
  ["captacao", "Captação de imóveis"],
  ["administrativo", "Administrativo"],
  ["marketing", "Marketing"],
  ["tecnologia", "Tecnologia"],
  ["outra", "Outra área"],
];
export const NOME_DA_AREA = Object.fromEntries(AREAS);
export const UNIDADES = ["Recife", "Caruaru", "Paulista"];
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
export const atualizarCandidatura = async (id, dados) => (await api.patch(`/rh/candidaturas/${encodeURIComponent(id)}`, dados)).candidatura;
export const apagarCandidatura = (id) => api.delete(`/rh/candidaturas/${encodeURIComponent(id)}`);
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

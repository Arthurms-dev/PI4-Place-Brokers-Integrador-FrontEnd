const API_URL = import.meta.env.VITE_API_URL;

function getAuthToken() {
  return localStorage.getItem("placebrokers_token");
}

function authHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResposta(res) {
  const corpo = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(corpo?.error?.message ?? "Não foi possível completar a operação.");
    err.code = corpo?.error?.code;
    err.fieldErrors = corpo?.error?.fieldErrors ?? {};
    throw err;
  }
  return corpo;
}

export async function getAgendamentos() {
  const res = await fetch(`${API_URL}/agendamentos`, { headers: authHeaders() });
  const { agendamentos } = await parseResposta(res);
  return agendamentos;
}

/**
 * @param {{ tipo: string, dataHora: string, duracaoMinutos?: number, clienteId: string,
 *   corretorId: string, empreendimentoId?: string, local?: string, observacoes?: string,
 *   leadOrigemId?: string }} dados
 */
export async function criarAgendamento(dados) {
  const res = await fetch(`${API_URL}/agendamentos`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(dados),
  });
  const { agendamento } = await parseResposta(res);
  return agendamento;
}

export async function remarcarAgendamento(id, dataHora) {
  const res = await fetch(`${API_URL}/agendamentos/${id}/data`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ dataHora }),
  });
  const { agendamento } = await parseResposta(res);
  return agendamento;
}

/**
 * @param {string} id
 * @param {string} status
 * @param {{ motivoCancelamento?: string, interesseAposVisita?: string }} [extra]
 */
export async function atualizarStatusAgendamento(id, status, extra = {}) {
  const res = await fetch(`${API_URL}/agendamentos/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status, ...extra }),
  });
  const { agendamento } = await parseResposta(res);
  return agendamento;
}

export async function getClientes() {
  const res = await fetch(`${API_URL}/clientes`, { headers: authHeaders() });
  const { clientes } = await parseResposta(res);
  return clientes;
}

export async function getEmpreendimentos() {
  const res = await fetch(`${API_URL}/empreendimentos`, { headers: authHeaders() });
  const { empreendimentos } = await parseResposta(res);
  return empreendimentos;
}
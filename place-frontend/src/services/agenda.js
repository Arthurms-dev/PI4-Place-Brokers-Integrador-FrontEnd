import { getToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

async function req(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const erro = data.error ?? data;
    throw Object.assign(new Error(erro.message ?? "Não foi possível completar a operação."), {
      code: erro.code,
      fieldErrors: erro.fieldErrors ?? {},
    });
  }
  return data;
}

export const listarAgendamentos = async () => (await req("/agendamentos")).agendamentos;
export const criarAgendamento = async (dados) =>
  (await req("/agendamentos", { method: "POST", body: JSON.stringify(dados) })).agendamento;
export const remarcarAgendamento = async (id, dataHora) =>
  (await req(`/agendamentos/${id}/data`, { method: "PATCH", body: JSON.stringify({ dataHora }) })).agendamento;
export const atualizarStatusAgendamento = async (id, status, extra = {}) =>
  (await req(`/agendamentos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, ...extra }) })).agendamento;
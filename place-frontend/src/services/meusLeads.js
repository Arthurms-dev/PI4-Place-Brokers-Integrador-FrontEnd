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
      fieldErrors: erro.fieldErrors ?? {},
    });
  }
  return data;
}

export const listarMeusLeads = async () => (await req("/leads/meus")).leads;
export const atualizarStatusLead = async (id, status) =>
  (await req(`/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) })).lead;
export const listarClientes = async () => (await req("/clientes")).clientes;
export const criarCliente = async (dados) => (await req("/clientes", { method: "POST", body: JSON.stringify(dados) })).cliente;
const API_URL = import.meta.env.VITE_API_URL;
import { getToken } from "@/lib/authToken";

function authHeaders() {
  const token = getToken();
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

export async function getClientes() {
  const res = await fetch(`${API_URL}/clientes`, { headers: authHeaders() });
  const { clientes } = await parseResposta(res);
  return clientes;
}

export async function getClienteById(id) {
  const res = await fetch(`${API_URL}/clientes/${id}`, { headers: authHeaders() });
  const { cliente } = await parseResposta(res);
  return cliente;
}

/**
 * @param {{ nome: string, email?: string, telefone: string, observacoes?: string,
 *   corretorId?: string, leadId?: string }} dados
 */
export async function criarCliente(dados) {
  const res = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(dados),
  });
  const { cliente } = await parseResposta(res);
  return cliente;
}

/**
 * @param {string} id
 * @param {{ nome?: string, email?: string, telefone?: string, observacoes?: string,
 *   corretorId?: string }} dados
 */
export async function atualizarCliente(id, dados) {
  const res = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(dados),
  });
  const { cliente } = await parseResposta(res);
  return cliente;
}
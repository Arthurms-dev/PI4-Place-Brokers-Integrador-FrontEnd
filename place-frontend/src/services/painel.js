import { getToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getAvisosSeguranca() {
  const response = await fetch(`${BASE_URL}/painel/avisos-seguranca`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Não foi possível carregar os avisos de segurança.");
  return response.json();
}

export async function getMelhorias() {
  const response = await fetch(`${BASE_URL}/painel/melhorias`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Não foi possível carregar as sugestões de melhoria.");
  return response.json();
}

export async function getModificacoes() {
  const response = await fetch(`${BASE_URL}/painel/modificacoes`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Não foi possível carregar as modificações do site.");
  return response.json();
}
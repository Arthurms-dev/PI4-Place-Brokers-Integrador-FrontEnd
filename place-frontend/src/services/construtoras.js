import { getToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listarConstrutoras() {
  const response = await fetch(`${BASE_URL}/construtoras`);
  if (!response.ok) throw new Error("Não foi possível carregar as construtoras.");
  return response.json();
}

/** @param {{ nome: string, logoUrl?: string, site?: string }} dados */
export async function criarConstrutora({ nome, logoUrl, site }) {
  const response = await fetch(`${BASE_URL}/construtoras`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ nome, logoUrl: logoUrl ?? null, site: site ?? null }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message ?? "Não foi possível criar a construtora.");
  return data;
}
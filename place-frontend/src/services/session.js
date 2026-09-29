import { getToken, clearToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const CARGO_LABEL = { admin: "Administrador", corretor: "Corretor", gerente: "Gerente", viabilizador: "Viabilizador" };

/**
 * @returns {Promise<null|{ name: string, email: string, role: string, cargo: string, avatarUrl: string|null, unreadNotifications: number }>}
 */
export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  let response;
  try {
    response = await fetch(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    return null;
  }

  if (!response.ok) {
    if (response.status === 401) clearToken();
    return null;
  }

  const { user } = await response.json();
  return {
    name: user.nome,
    email: user.email,
    role: CARGO_LABEL[user.role] ?? user.role,
    cargo: user.role,
    avatarUrl: null,
    unreadNotifications: 0,
  };
}

/** @param {{ nome?: string, telefone?: string }} dados */
export async function atualizarPerfil(dados) {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(dados),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message ?? "Não foi possível atualizar o perfil.");
  return data.user;
}
import { getToken, clearToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const CARGO_LABEL = { admin: "Administrador", corretor: "Corretor", viabilizador: "Viabilizador" };

/**
 * @returns {Promise<null|{ name: string, role: string, cargo: string, unreadNotifications: number }>}
 */
export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  let response;
  try {
    response = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
    role: CARGO_LABEL[user.role] ?? user.role,
    cargo: user.role,
    unreadNotifications: 0,
  };
}
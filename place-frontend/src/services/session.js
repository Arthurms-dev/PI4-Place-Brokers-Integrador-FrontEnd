import { getToken, clearToken } from "@/lib/authToken";
import { api } from "@/lib/apiClient";

const CARGO_LABEL = {
  admin: "Administrador", corretor: "Corretor", gerente: "Gerente", viabilizador: "Viabilizador",
};
let consultaUsuario = null;
let tokenConsulta = null;

/** @returns {Promise<null|{name: string, email: string, role: string, cargo: string, avatarUrl: string|null, unreadNotifications: number}>} */
export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;
  if (consultaUsuario && tokenConsulta === token) return consultaUsuario;

  const requisicao = (async () => {
    try {
      const { user } = await api.get("/auth/me");
      if (getToken() !== token) return null;
      return {
        name: user.nome, email: user.email, role: CARGO_LABEL[user.role] ?? user.role,
        cargo: user.role, avatarUrl: null, unreadNotifications: 0,
      };
    } catch (erro) {
      if (erro?.status === 401 && getToken() === token) clearToken();
      return null;
    }
  })();
  consultaUsuario = requisicao;
  tokenConsulta = token;
  try {
    return await requisicao;
  } finally {
    if (consultaUsuario === requisicao) {
      consultaUsuario = null;
      tokenConsulta = null;
    }
  }
}

/** @param {{ nome?: string, telefone?: string }} dados */
export const atualizarPerfil = async (dados) => (await api.patch("/auth/me", dados)).user;
export async function alterarSenha({ senhaAtual, novaSenha, confirmarSenha }) {
  await api.patch("/auth/senha", { senhaAtual, novaSenha, confirmarSenha });
  return true;
}

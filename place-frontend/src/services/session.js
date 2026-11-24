import { AUTH_CHANGE_EVENT, getToken, clearToken } from "@/lib/authToken";
import { api } from "@/lib/apiClient";

const CARGO_LABEL = {
  admin: "Administrador", corretor: "Corretor", gerente: "Gerente", viabilizador: "Viabilizador",
  rh: "RH", recepcao: "Recepção", diretor: "Diretor", cadastro: "Cadastro",
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
        cargo: user.role, avatarUrl: user.avatarUrl ?? null, unreadNotifications: 0,
        avisoLeadEmail: Boolean(user.avisoLeadEmail),
        trocarSenha: user.trocarSenha === true,
        telefone: user.telefone ?? null,
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

/** @param {{ nome?: string, telefone?: string, avisoLeadEmail?: boolean }} dados */
export const atualizarPerfil = async (dados) => (await api.patch("/auth/me", dados)).user;
export async function alterarSenha({ senhaAtual, novaSenha, confirmarSenha }) {
  await api.patch("/auth/senha", { senhaAtual, novaSenha, confirmarSenha });
  return true;
}

export const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;
export const TIPOS_DE_FOTO = ["image/jpeg", "image/png", "image/webp"];
// Avisa o painel para buscar o usuário de novo: a foto do topo troca na hora.
const avisarTroca = () => window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));

/** @param {File} arquivo @returns {Promise<string>} URL da foto nova */
export async function trocarFotoPerfil(arquivo) {
  const corpo = new FormData();
  corpo.append("foto", arquivo);
  const { avatarUrl } = await api.put("/auth/me/foto", corpo);
  avisarTroca();
  return avatarUrl;
}

export async function removerFotoPerfil() {
  await api.delete("/auth/me/foto");
  avisarTroca();
}

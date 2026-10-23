import { getToken, clearToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

const CARGO_LABEL = {
  admin: "Administrador",
  corretor: "Corretor",
  gerente: "Gerente",
  viabilizador: "Viabilizador",
};

let consultaUsuario = null;
let tokenConsulta = null;

/**
 *
 * @returns {Promise<null|{
 *   name: string,
 *   email: string,
 *   role: string,
 *   cargo: string,
 *   avatarUrl: string|null,
 *   unreadNotifications: number
 * }>}
 */
export async function getCurrentUser() {
  const token = getToken();

  if (!token) return null;

  if (consultaUsuario && tokenConsulta === token) {
    return consultaUsuario;
  }

  const requisicao = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 && getToken() === token) {
          clearToken();
        }

        return null;
      }

      const { user } = await response.json();

      if (getToken() !== token) {
        return null;
      }

      return {
        name: user.nome,
        email: user.email,
        role: CARGO_LABEL[user.role] ?? user.role,
        cargo: user.role,
        avatarUrl: null,
        unreadNotifications: 0,
      };
    } catch {
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

/**
 * @param {{ nome?: string, telefone?: string }} dados
 */
export async function atualizarPerfil(dados) {
  const token = getToken();

  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dados),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ?? "Não foi possível atualizar o perfil."
    );
  }

  return data.user;
}

export async function alterarSenha({
  senhaAtual,
  novaSenha,
  confirmarSenha,
}) {
  const response = await fetch(`${BASE_URL}/auth/senha`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      senhaAtual,
      novaSenha,
      confirmarSenha,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw Object.assign(
      new Error(
        data.message ?? "Não foi possível alterar a senha."
      ),
      {
        fieldErrors: data.fieldErrors ?? {},
      }
    );
  }

  return true;
}

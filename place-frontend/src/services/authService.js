import { setToken, clearToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthError extends Error {
  constructor(code, message, fieldErrors = {}) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

async function post(path, body) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError("NETWORK_ERROR", "Não foi possível conectar ao servidor. Tente novamente.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AuthError(data.code ?? "SERVER_ERROR", data.message ?? "Erro ao processar a solicitação.", data.fieldErrors ?? {});
  }
  return data;
}

export class AuthService {
  validateLogin({ email, password } = {}) {
    const errors = {};
    if (!email?.trim()) errors.email = "Informe o e-mail.";
    else if (!EMAIL_REGEX.test(email.trim())) errors.email = "E-mail inválido.";
    if (!password) errors.password = "Informe a senha.";
    else if (password.length < 6) errors.password = "A senha deve ter pelo menos 6 caracteres.";
    return errors;
  }

  /** @returns {Promise<{ user: { id, nome, email, role }, token: string }>} */
  async login(credentials) {
    const fieldErrors = this.validateLogin(credentials);
    if (Object.keys(fieldErrors).length) {
      throw new AuthError("VALIDATION_ERROR", "Verifique os campos destacados.", fieldErrors);
    }
    const result = await post("/auth/login", credentials);
    if (result.token) setToken(result.token);
    return result;
  }

  /** @param {{ name?, email?, password?, confirmPassword?, role?, vinculo?, creci? }} payload */
  validateRegister({ name, email, password, confirmPassword, role, vinculo, creci } = {}) {
    const errors = this.validateLogin({ email, password });
    if (!name?.trim()) errors.name = "Informe o nome completo.";
    if (confirmPassword !== password) errors.confirmPassword = "As senhas não coincidem.";
    if (!role) errors.role = "Selecione um perfil.";

    if (role === "CORRETOR") {
      if (!vinculo) errors.vinculo = "Informe se é corretor da Place ou parceiro externo.";
      if (vinculo === "externo" && !creci?.trim()) errors.creci = "CRECI é obrigatório para corretores externos.";
    }
    return errors;
  }

  async register(payload) {
    const fieldErrors = this.validateRegister(payload);
    if (Object.keys(fieldErrors).length) {
      throw new AuthError("VALIDATION_ERROR", "Verifique os campos destacados.", fieldErrors);
    }
    return post("/auth/register", {
      nome: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      role: payload.role.toLowerCase(),
      vinculo: payload.vinculo ?? null,
      creci: payload.creci?.trim() || null,
    });
  }

  logout() {
    clearToken();
  }
}

export const authService = new AuthService();
import { setToken, clearToken } from "@/lib/authToken";
import { apiRequest, API_URL } from "@/lib/apiClient";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthError extends Error {
  constructor(code, message, fieldErrors = {}) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** Usa o mesmo cliente HTTP que os outros serviços e mantém injeção de fetch para testes.
 * Rotas de login/registro são públicas e NUNCA recebem bearer existente. */
async function post(path, body, { fetchImpl = fetch, baseUrl = API_URL } = {}) {
  try {
    return await apiRequest(path, {
      method: "POST", body, auth: false, fetchImpl, baseUrl,
    });
  } catch (error) {
    if (error.status == null) {
      throw new AuthError("NETWORK_ERROR", "Não foi possível conectar ao servidor. Tente novamente.");
    }
    const code = error.code ?? (error.status === 401 ? "INVALID_CREDENTIALS" : "SERVER_ERROR");
    throw new AuthError(code, error.message ?? "Erro ao processar a solicitação.", error.fieldErrors ?? {});
  }
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

  constructor({ fetchImpl = fetch, baseUrl = API_URL } = {}) {
    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl;
  }

  /** @returns {Promise<{ user: { id: string, nome: string, email: string, role: string }, token: string }>} */
  async login(credentials) {
    const fieldErrors = this.validateLogin(credentials);
    if (Object.keys(fieldErrors).length) {
      throw new AuthError("VALIDATION_ERROR", "Verifique os campos destacados.", fieldErrors);
    }
    const result = await post("/auth/login", credentials, this);
    if (result.token) setToken(result.token);
    return result;
  }

  /** @param {{ name?: string, email?: string, password?: string, confirmPassword?: string,
   * role?: string, vinculo?: string, creci?: string, uf?: string, construtoraId?: string }} payload */
  validateRegister({ name, email, password, confirmPassword, role, vinculo, creci, uf, construtoraId } = {}) {
    const errors = this.validateLogin({ email, password });
    if (!name?.trim()) errors.name = "Informe o nome completo.";
    if (confirmPassword !== password) errors.confirmPassword = "As senhas não coincidem.";
    if (!role) errors.role = "Selecione um perfil.";
    if (role === "CORRETOR") {
      if (!vinculo) errors.vinculo = "Informe se é corretor da Place ou parceiro externo.";
      if (vinculo === "externo" && !creci?.trim()) errors.creci = "CRECI é obrigatório para corretores externos.";
      if (vinculo === "externo" && !uf) errors.uf = "Informe o estado em que você atua.";
    }
    if (role === "VIABILIZADOR" && !construtoraId) errors.construtoraId = "Selecione a construtora em que você trabalha.";
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
      uf: payload.uf || null,
      construtoraId: payload.role === "VIABILIZADOR" ? payload.construtoraId : null,
    }, this);
  }

  /** Não revela se o email informado existe na base. */
  async esqueciSenha(email) {
    const limpo = String(email ?? "").trim().toLowerCase();
    if (!limpo) throw new AuthError("VALIDATION_ERROR", "Verifique os campos destacados.", { email: "Informe o e-mail." });
    if (!EMAIL_REGEX.test(limpo)) throw new AuthError("VALIDATION_ERROR", "Verifique os campos destacados.", { email: "E-mail inválido." });
    return post("/auth/esqueci-senha", { email: limpo }, this);
  }

  validateNovaSenha({ novaSenha, confirmarSenha } = {}) {
    const errors = {};
    if (!novaSenha || novaSenha.length < 8) errors.novaSenha = "A senha deve ter pelo menos 8 caracteres.";
    if (confirmarSenha !== novaSenha) errors.confirmarSenha = "As senhas não coincidem.";
    return errors;
  }

  async redefinirSenha({ token, novaSenha, confirmarSenha }) {
    const fieldErrors = this.validateNovaSenha({ novaSenha, confirmarSenha });
    if (Object.keys(fieldErrors).length) {
      throw new AuthError("VALIDATION_ERROR", "Verifique os campos destacados.", fieldErrors);
    }
    return post("/auth/redefinir-senha", { token, novaSenha, confirmarSenha }, this);
  }

  logout() { clearToken(); }
}

export const authService = new AuthService();

/**
 * @typedef {"VALIDATION_ERROR"|"INVALID_CREDENTIALS"|"USER_ALREADY_EXISTS"|"NETWORK_ERROR"|"SERVER_ERROR"} AuthErrorCode
 */
export class AuthError extends Error {
  /**
   * @param {AuthErrorCode} code
   * @param {string} message
   * @param {Record<string,string>} [fieldErrors] 
   */
  constructor(code, message, fieldErrors = {}) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthService {
  constructor({ baseUrl = import.meta.env.VITE_API_URL ?? "", fetchImpl = fetch } = {}) {
    this.baseUrl = baseUrl;
    this.fetchImpl = fetchImpl;
  }

  /**
   * @param {{ email?: string, password?: string }} credentials
   * @returns {Record<string,string>} 
   */
  validateLogin({ email, password } = {}) {
    const errors = {};

    if (!email?.trim()) errors.email = "Informe o e-mail.";
    else if (!EMAIL_REGEX.test(email.trim())) errors.email = "E-mail inválido.";

    if (!password) errors.password = "Informe a senha.";
    else if (password.length < 6) errors.password = "A senha deve ter pelo menos 6 caracteres.";

    return errors;
  }

  /**
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user: { name: string, role: "ADMIN"|"CORRETOR" }, token: string }>}
   */
  async login(credentials) {
    const fieldErrors = this.validateLogin(credentials);
    if (Object.keys(fieldErrors).length > 0) {
      throw new AuthError("VALIDATION_ERROR", "Verifique os campos destacados.", fieldErrors);
    }

    let response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        }),
      });
    } catch {
      throw new AuthError("NETWORK_ERROR", "Não foi possível conectar ao servidor. Tente novamente.");
    }

    if (response.status === 401 || response.status === 404) {
      throw new AuthError("INVALID_CREDENTIALS", "E-mail ou senha incorretos.");
    }
    if (!response.ok) {
      throw new AuthError("SERVER_ERROR", "Erro ao processar o login. Tente novamente mais tarde.");
    }

    const data = await response.json();
    if (!data?.user || !data?.token) {
      throw new AuthError("SERVER_ERROR", "Resposta inesperada do servidor.");
    }
    return data;
  }

  validateRegister({ name, email, password, confirmPassword, role } = {}) {
    const errors = this.validateLogin({ email, password });
    if (!name?.trim()) errors.name = "Informe o nome completo.";
    if (confirmPassword !== password) errors.confirmPassword = "As senhas não coincidem.";
    if (!role) errors.role = "Selecione um perfil.";
    return errors;
  }

  /**
   * @returns {Promise<{ user: object, token: string }>}
   */
  async register(payload) {
    const fieldErrors = this.validateRegister(payload);
    if (Object.keys(fieldErrors).length > 0) {
      throw new AuthError("VALIDATION_ERROR", "Verifique os campos destacados.", fieldErrors);
    }

    let response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
          role: payload.role,
        }),
      });
    } catch {
      throw new AuthError("NETWORK_ERROR", "Não foi possível conectar ao servidor. Tente novamente.");
    }

    if (response.status === 409) {
      throw new AuthError("USER_ALREADY_EXISTS", "Já existe uma conta com este e-mail.");
    }
    if (!response.ok) {
      throw new AuthError("SERVER_ERROR", "Erro ao criar a conta. Tente novamente mais tarde.");
    }
    return response.json();
  }
}

export const authService = new AuthService();
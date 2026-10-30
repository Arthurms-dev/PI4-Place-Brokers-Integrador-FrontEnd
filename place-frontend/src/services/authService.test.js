import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService, AuthError } from "./authService";

function mockFetchOnce(status, body) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe("AuthService", () => {
  describe("validateLogin", () => {
    let service;

    beforeEach(() => {
      service = new AuthService({ fetchImpl: vi.fn() });
    });

    it("retorna erro quando o e-mail está vazio", () => {
      const errors = service.validateLogin({ email: "", password: "123456" });
      expect(errors.email).toBeDefined();
    });

    it("retorna erro quando o e-mail tem formato inválido", () => {
      const errors = service.validateLogin({ email: "arthur@@place", password: "123456" });
      expect(errors.email).toBeDefined();
    });

    it("retorna erro quando a senha está vazia", () => {
      const errors = service.validateLogin({ email: "arthur@placebrokers.com.br", password: "" });
      expect(errors.password).toBeDefined();
    });

    it("retorna erro quando a senha é muito curta", () => {
      const errors = service.validateLogin({ email: "arthur@placebrokers.com.br", password: "123" });
      expect(errors.password).toBeDefined();
    });

    it("não retorna erros para dados válidos", () => {
      const errors = service.validateLogin({ email: "arthur@placebrokers.com.br", password: "123456" });
      expect(errors).toEqual({});
    });
  });

  describe("login", () => {
    it("caso de sucesso: retorna usuário e token", async () => {
      const fetchImpl = mockFetchOnce(200, {
        user: { name: "Arthur Vinícius", role: "ADMIN" },
        token: "fake-jwt-token",
      });
      const service = new AuthService({ fetchImpl, baseUrl: "http://api.test" });

      const result = await service.login({ email: "arthur@placebrokers.com.br", password: "123456" });

      expect(result.user.role).toBe("ADMIN");
      expect(result.token).toBe("fake-jwt-token");
      expect(fetchImpl).toHaveBeenCalledWith(
        "http://api.test/auth/login",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("dados inválidos: não chama a API e lança AuthError de validação", async () => {
      const fetchImpl = vi.fn();
      const service = new AuthService({ fetchImpl });

      await expect(service.login({ email: "", password: "" })).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
      expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("campos obrigatórios: indica em fieldErrors qual campo falta", async () => {
      const service = new AuthService({ fetchImpl: vi.fn() });

      try {
        await service.login({ email: "arthur@placebrokers.com.br", password: "" });
        expect.unreachable("deveria ter lançado AuthError");
      } catch (err) {
        expect(err).toBeInstanceOf(AuthError);
        expect(err.fieldErrors.password).toBeDefined();
      }
    });

    it("usuário inexistente ou senha incorreta: lança AuthError INVALID_CREDENTIALS", async () => {
      const fetchImpl = mockFetchOnce(401, { message: "Unauthorized" });
      const service = new AuthService({ fetchImpl });

      await expect(
        service.login({ email: "naoexiste@placebrokers.com.br", password: "123456" }),
      ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
    });

    it("erro de servidor: lança AuthError SERVER_ERROR", async () => {
      const fetchImpl = mockFetchOnce(500, { message: "Internal Server Error" });
      const service = new AuthService({ fetchImpl });

      await expect(
        service.login({ email: "arthur@placebrokers.com.br", password: "123456" }),
      ).rejects.toMatchObject({ code: "SERVER_ERROR" });
    });

    it("falha de rede: lança AuthError NETWORK_ERROR", async () => {
      const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
      const service = new AuthService({ fetchImpl });

      await expect(
        service.login({ email: "arthur@placebrokers.com.br", password: "123456" }),
      ).rejects.toMatchObject({ code: "NETWORK_ERROR" });
    });

  });

  describe("esqueciSenha", () => {
    it("manda o e-mail limpo para a API", async () => {
      const fetchImpl = mockFetchOnce(200, { ok: true, message: "Se este e-mail estiver cadastrado..." });
      const service = new AuthService({ fetchImpl, baseUrl: "http://api.test" });
      const r = await service.esqueciSenha("  Maria@Exemplo.com ");
      expect(r.ok).toBe(true);
      const [url, opcoes] = fetchImpl.mock.calls[0];
      expect(url).toBe("http://api.test/auth/esqueci-senha");
      expect(JSON.parse(opcoes.body)).toEqual({ email: "maria@exemplo.com" });
    });

    it("e-mail inválido não chama a API", async () => {
      const fetchImpl = vi.fn();
      const service = new AuthService({ fetchImpl });
      await expect(service.esqueciSenha("maria@")).rejects.toMatchObject({ code: "VALIDATION_ERROR", fieldErrors: { email: "E-mail inválido." } });
      expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("limite de pedidos devolve a mensagem da API", async () => {
      const fetchImpl = mockFetchOnce(429, { code: "TOO_MANY_REQUESTS", message: "Já enviamos alguns links para este e-mail." });
      const service = new AuthService({ fetchImpl });
      await expect(service.esqueciSenha("maria@exemplo.com")).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
    });
  });

  describe("redefinirSenha", () => {
    it("confere a senha antes de chamar a API", async () => {
      const fetchImpl = vi.fn();
      const service = new AuthService({ fetchImpl });
      await expect(service.redefinirSenha({ token: "t", novaSenha: "curta", confirmarSenha: "outra" }))
        .rejects.toMatchObject({ code: "VALIDATION_ERROR" });
      expect(fetchImpl).not.toHaveBeenCalled();
    });

    it("envia token e senha nova", async () => {
      const fetchImpl = mockFetchOnce(200, { ok: true });
      const service = new AuthService({ fetchImpl, baseUrl: "http://api.test" });
      await service.redefinirSenha({ token: "abc", novaSenha: "senha-nova-1", confirmarSenha: "senha-nova-1" });
      const [url, opcoes] = fetchImpl.mock.calls[0];
      expect(url).toBe("http://api.test/auth/redefinir-senha");
      expect(JSON.parse(opcoes.body)).toEqual({ token: "abc", novaSenha: "senha-nova-1", confirmarSenha: "senha-nova-1" });
    });

    it("link vencido vira TOKEN_INVALIDO", async () => {
      const fetchImpl = mockFetchOnce(400, { code: "TOKEN_INVALIDO", message: "Este link expirou ou já foi usado." });
      const service = new AuthService({ fetchImpl });
      await expect(service.redefinirSenha({ token: "abc", novaSenha: "senha-nova-1", confirmarSenha: "senha-nova-1" }))
        .rejects.toMatchObject({ code: "TOKEN_INVALIDO" });
    });
  });

  describe("register", () => {
    it.todo("caso de sucesso: cria a conta e retorna usuário e token");
    it.todo("dados inválidos: não chama a API e lança AuthError de validação");
    it.todo("e-mail já cadastrado: lança AuthError USER_ALREADY_EXISTS");
    it.todo("senhas não coincidem: fieldErrors.confirmPassword é preenchido");
  });
});
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

  describe("register", () => {
    it.todo("caso de sucesso: cria a conta e retorna usuário e token");
    it.todo("dados inválidos: não chama a API e lança AuthError de validação");
    it.todo("e-mail já cadastrado: lança AuthError USER_ALREADY_EXISTS");
    it.todo("senhas não coincidem: fieldErrors.confirmPassword é preenchido");
  });
});
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_CHANGE_EVENT, AUTH_TOKEN_KEY, clearToken, getToken, setToken } from "./authToken";

describe("sessao entre abas", () => {
  beforeEach(() => window.localStorage.removeItem(AUTH_TOKEN_KEY));

  it("salva token na origem e avisa os componentes da aba atual", () => {
    const listener = vi.fn();
    window.addEventListener(AUTH_CHANGE_EVENT, listener);
    try {
      setToken("token-ficticio");
      expect(getToken()).toBe("token-ficticio");
      clearToken();
      expect(getToken()).toBeNull();
      expect(listener).toHaveBeenCalledTimes(2);
    } finally {
      window.removeEventListener(AUTH_CHANGE_EVENT, listener);
    }
  });
});

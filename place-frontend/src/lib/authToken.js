export const AUTH_TOKEN_KEY = "placebrokers_token";
// O token vale 1 hora; o refresh token troca por um novo sem pedir a senha (POST /auth/renovar).
export const REFRESH_TOKEN_KEY = "placebrokers_refresh";
export const AUTH_CHANGE_EVENT = "placebrokers:auth-change";

function avisarMudanca() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

export const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export function setToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  avisarMudanca();
}
export function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  avisarMudanca();
}

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export function setRefreshToken(valor) {
  if (valor) localStorage.setItem(REFRESH_TOKEN_KEY, valor);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}
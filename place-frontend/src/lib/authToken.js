export const AUTH_TOKEN_KEY = "placebrokers_token";
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
  avisarMudanca();
}
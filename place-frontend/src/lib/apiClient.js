import { getToken } from "@/lib/authToken";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

/**
 * Cliente HTTP único para a API da Place Brokers.
 *
 * - Envia o token salvo no login (`Authorization: Bearer ...`).
 * - Aceita os dois formatos de erro que a API devolve hoje:
 *   `{ error: { code, message, fieldErrors } }` e `{ code, message, fieldErrors }`.
 * - Lança um `Error` com `message`, `code`, `status` e `fieldErrors`
 *   (para os formulários marcarem os campos com problema).
 *
 * @param {string} path Caminho a partir da raiz da API, ex.: "/leads/meus".
 * @param {RequestInit & { body?: any }} [options]
 */
export async function apiRequest(path, options = {}) {
  const { body, headers, ...resto } = options;
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...resto,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(body !== undefined && { body: typeof body === "string" ? body : JSON.stringify(body) }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const erro = (data && typeof data.error === "object" ? data.error : data) ?? {};
    throw Object.assign(new Error(erro.message ?? "Não foi possível completar a operação."), {
      code: erro.code,
      status: res.status,
      fieldErrors: erro.fieldErrors ?? {},
    });
  }

  return data;
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, body, options) => apiRequest(path, { ...options, method: "POST", body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: "PATCH", body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: "PUT", body }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
};

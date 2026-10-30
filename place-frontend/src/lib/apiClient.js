import { getToken } from "@/lib/authToken";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

/** Cliente HTTP único. `auth: false` evita enviar token nas rotas públicas.
 * FormData não recebe Content-Type manual: o browser define o boundary.
 * Erros no formato { error: {...} } e { code, message, fieldErrors } são suportados.
 */
export async function apiRequest(path, options = {}) {
  const { body, headers, auth = true, fetchImpl = fetch, baseUrl = API_URL, ...resto } = options;
  const token = auth ? getToken() : null;
  const formData = typeof FormData !== "undefined" && body instanceof FormData;
  const cabecalhos = new Headers(headers ?? {});
  if (body !== undefined && body !== null && !formData && !cabecalhos.has("Content-Type")) {
    cabecalhos.set("Content-Type", "application/json");
  }
  if (token && !cabecalhos.has("Authorization")) cabecalhos.set("Authorization", `Bearer ${token}`);

  const res = await fetchImpl(`${baseUrl}${path}`, {
    ...resto,
    headers: cabecalhos,
    ...(body !== undefined && {
      body: formData || typeof body === "string" ? body : JSON.stringify(body),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const erro = data && typeof data.error === "object" && data.error !== null ? data.error : data ?? {};
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

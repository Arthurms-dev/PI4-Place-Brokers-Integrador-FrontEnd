import { getToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

async function req(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}`, ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.message ?? "Não foi possível completar a operação."), {
      code: data.code,
      fieldErrors: data.fieldErrors ?? {},
    });
  }
  return data;
}

export const listarVendas = () => req("/vendas");
export const criarVenda = (dados) => req("/vendas", { method: "POST", body: JSON.stringify(dados) });
export const decidirVenda = (id, status) => req(`/vendas/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
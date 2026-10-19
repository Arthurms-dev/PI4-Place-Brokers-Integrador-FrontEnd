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
const corpo = (obj) => JSON.stringify(obj);

export const listarMembros = () => req("/equipe");
export const atualizarMembro = (id, mudancas) => req(`/equipe/${id}`, { method: "PATCH", body: corpo(mudancas) });
export const criarGerente = (dados) => req("/equipe/gerentes", { method: "POST", body: corpo(dados) });

export const listarTimes = () => req("/equipe/times");
export const criarTime = (dados) => req("/equipe/times", { method: "POST", body: corpo(dados) });
export const atualizarTime = (id, dados) => req(`/equipe/times/${id}`, { method: "PATCH", body: corpo(dados) });
export const removerTime = (id) => req(`/equipe/times/${id}`, { method: "DELETE" });

export const listarDiretorias = () => req("/equipe/diretorias");
export const criarDiretoria = (dados) => req("/equipe/diretorias", { method: "POST", body: corpo(dados) });
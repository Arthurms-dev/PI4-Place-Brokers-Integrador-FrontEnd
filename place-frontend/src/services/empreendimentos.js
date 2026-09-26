import { getToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export const STATUS = {
  lancamento: { label: "Lançamento", color: "var(--color-ok)" },
  obras: { label: "Em obras", color: "var(--color-info)" },
  pronto: { label: "Pronto", color: "var(--color-gold)" },
  outros: { label: "Outros", color: "var(--color-ink-3)" },
};

export function formatarFaixa(min, max, singular, plural) {
  if (min == null && max == null) return "";
  if (max == null || min === max) return `${min} ${min === 1 ? singular : plural}`;
  return `${min} e ${max} ${plural}`;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listarEmpreendimentos() {
  const response = await fetch(`${BASE_URL}/empreendimentos`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Não foi possível carregar os empreendimentos.");
  return response.json();
}

export async function buscarEmpreendimentoPorId(id) {
  const response = await fetch(`${BASE_URL}/empreendimentos/${id}`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Empreendimento não encontrado.");
  return response.json();
}

/**
 * @param {{
 *   nome, construtoraId?, status, descricao?, uf, cidade, bairro, endereco?,
 *   latitude?, longitude?, quartosMin?, quartosMax?, vagasMin?, vagasMax?,
 *   precoMin?, precoMax?, lazer?: string[], publicado?: boolean,
 *   capa?: File, galeria?: File[], book?: File, tabela?: File,
 * }} dados
 */
export async function criarEmpreendimento(dados) {
  const form = new FormData();
  const ARQUIVOS = ["capa", "galeria", "book", "tabela"];

  for (const [chave, valor] of Object.entries(dados)) {
    if (ARQUIVOS.includes(chave) || valor == null) continue;
    form.append(chave, chave === "lazer" ? JSON.stringify(valor) : String(valor));
  }
  if (dados.capa) form.append("capa", dados.capa);
  if (dados.book) form.append("book", dados.book);
  if (dados.tabela) form.append("tabela", dados.tabela);
  dados.galeria?.forEach((arquivo) => form.append("galeria", arquivo));

  const response = await fetch(`${BASE_URL}/empreendimentos`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(data.message ?? "Não foi possível salvar."), { fieldErrors: data.fieldErrors ?? {} });
  }
  return data;
}
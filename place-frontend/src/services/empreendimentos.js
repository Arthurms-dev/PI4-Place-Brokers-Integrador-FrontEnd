import { getToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export const STATUS = {
  lancamento: { label: "Lançamento", color: "var(--color-ok)" },
  obras: { label: "Em obras", color: "var(--color-info)" },
  pronto: { label: "Pronto", color: "var(--color-gold)" },
  outros: { label: "Outros", color: "var(--color-ink-3)" },
};

function limite(valor) {
  if (valor == null || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

export function formatarFaixa(min, max, singular, plural) {
  const minimo = limite(min);
  const maximo = limite(max);

  if (minimo == null && maximo == null) return "";
  if (minimo != null && maximo != null && minimo > maximo) return "";
  if (minimo == null) {
    return `Até ${maximo} ${maximo === 1 ? singular : plural}`;
  }
  if (maximo == null || minimo === maximo) {
    return `${minimo} ${minimo === 1 ? singular : plural}`;
  }
  return `${minimo} e ${maximo} ${plural}`;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listarEmpreendimentos({ publico = false } = {}) {
  const response = await fetch(`${BASE_URL}/empreendimentos`, {
    headers: publico ? {} : authHeaders(),
  });
  if (!response.ok) {
    throw new Error("Não foi possível carregar os empreendimentos.");
  }
  return response.json();
}

export async function buscarEmpreendimentoPorId(id) {
  const response = await fetch(`${BASE_URL}/empreendimentos/${id}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    throw new Error("Empreendimento não encontrado.");
  }
  return response.json();
}

export async function criarEmpreendimento(dados) {
  const form = new FormData();
  const arquivos = ["capa", "galeria", "book", "tabela"];

  for (const [chave, valor] of Object.entries(dados)) {
    if (arquivos.includes(chave) || valor == null) continue;
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

  const resultado = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(
      new Error(resultado.message ?? "Não foi possível salvar."),
      { fieldErrors: resultado.fieldErrors ?? {} }
    );
  }
  return resultado;
}

export async function atualizarEmpreendimento(id, mudancas) {
  const response = await fetch(`${BASE_URL}/empreendimentos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(mudancas),
  });

  const resultado = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(
      new Error(resultado.message ?? "Não foi possível salvar."),
      { fieldErrors: resultado.fieldErrors ?? {} }
    );
  }
  return resultado;
}

export async function listarDocumentosComerciais(id) {
  const response = await fetch(`${BASE_URL}/empreendimentos/${id}/documentos`, {
    headers: authHeaders(),
  });
  const resultado = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(resultado.message ?? "Não foi possível consultar os documentos.");
  }
  return resultado;
}

export async function urlDoDocumentoPorId(id, docId) {
  const response = await fetch(
    `${BASE_URL}/empreendimentos/${id}/documentos/arquivo/${docId}`,
    { headers: authHeaders() }
  );
  const resultado = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(resultado.message ?? "Não foi possível abrir o documento.");
  }
  return resultado.url;
}

export async function urlDoDocumento(id, tipo) {
  const response = await fetch(
    `${BASE_URL}/empreendimentos/${id}/documentos/${tipo}`,
    { headers: authHeaders() }
  );
  const resultado = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(resultado.message ?? "Não foi possível abrir o documento.");
  }
  return resultado.url;
}

async function salvarTipologia(url, metodo, dados) {
  const response = await fetch(url, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(dados),
  });

  const resultado = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(
      new Error(resultado.message ?? "Não foi possível salvar a planta."),
      { fieldErrors: resultado.fieldErrors ?? {} }
    );
  }
  return resultado;
}

export function criarTipologia(empreendimentoId, dados) {
  return salvarTipologia(
    `${BASE_URL}/empreendimentos/${empreendimentoId}/tipologias`,
    "POST",
    dados
  );
}

export function atualizarTipologia(empreendimentoId, tipologiaId, dados) {
  return salvarTipologia(
    `${BASE_URL}/empreendimentos/${empreendimentoId}/tipologias/${tipologiaId}`,
    "PATCH",
    dados
  );
}

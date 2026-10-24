import { getToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

async function requisitar(url, metodo = "GET", dados = undefined) {
  const token = getToken();
  if (!token) throw new Error("Faça login como administrador.");
  const response = await fetch(`${BASE_URL}${url}`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(dados === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(dados === undefined ? {} : { body: JSON.stringify(dados) }),
  });
  const resultado = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(resultado.message ?? "Falha ao gerenciar documento."), {
      fieldErrors: resultado.fieldErrors ?? {},
    });
  }
  return resultado;
}

export function listarDocumentosAdmin(empreendimentoId) {
  return requisitar(`/empreendimentos/${encodeURIComponent(empreendimentoId)}/documentos/admin`);
}
export function criarDocumentoAdmin(empreendimentoId, dados) {
  return requisitar(`/empreendimentos/${encodeURIComponent(empreendimentoId)}/documentos/admin`, "POST", dados);
}
export function atualizarDocumentoAdmin(empreendimentoId, docId, dados) {
  return requisitar(`/empreendimentos/${encodeURIComponent(empreendimentoId)}/documentos/admin/${encodeURIComponent(docId)}`, "PATCH", dados);
}

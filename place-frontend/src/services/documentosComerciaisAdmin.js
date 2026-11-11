import { getToken } from "@/lib/authToken";
import { api } from "@/lib/apiClient";

function garantirAdmin() {
  if (!getToken()) throw new Error("Faça login como administrador.");
}
export function listarDocumentosAdmin(empreendimentoId) {
  garantirAdmin();
  return api.get(`/empreendimentos/${encodeURIComponent(empreendimentoId)}/documentos/admin`);
}
export function criarDocumentoAdmin(empreendimentoId, dados) {
  garantirAdmin();
  return api.post(`/empreendimentos/${encodeURIComponent(empreendimentoId)}/documentos/admin`, dados);
}
export function atualizarDocumentoAdmin(empreendimentoId, docId, dados) {
  garantirAdmin();
  return api.patch(`/empreendimentos/${encodeURIComponent(empreendimentoId)}/documentos/admin/${encodeURIComponent(docId)}`, dados);
}

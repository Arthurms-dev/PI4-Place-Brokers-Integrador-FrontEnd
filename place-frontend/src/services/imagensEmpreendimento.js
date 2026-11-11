import { getToken } from "@/lib/authToken";
import { api } from "@/lib/apiClient";

function garantirAdmin() {
  if (!getToken()) throw new Error("Faça login como administrador.");
}
export function trocarCapaEmpreendimento(id, imagem) {
  garantirAdmin();
  const corpo = new FormData();
  corpo.append("imagem", imagem);
  return api.post(`/empreendimentos/${encodeURIComponent(id)}/imagens/capa`, corpo);
}
export function adicionarFotosEmpreendimento(id, imagens) {
  garantirAdmin();
  const corpo = new FormData();
  for (const imagem of imagens) corpo.append("imagens", imagem);
  return api.post(`/empreendimentos/${encodeURIComponent(id)}/imagens/galeria`, corpo);
}
export function removerFotoEmpreendimento(id, imagemId) {
  garantirAdmin();
  return api.delete(`/empreendimentos/${encodeURIComponent(id)}/imagens/${encodeURIComponent(imagemId)}`);
}

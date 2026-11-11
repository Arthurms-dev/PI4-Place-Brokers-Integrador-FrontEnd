import { getToken } from "@/lib/authToken";
import { api } from "@/lib/apiClient";

export async function listarPendenciasDrive() {
  if (!getToken()) throw new Error("Faça login como administrador.");
  const dados = await api.get("/empreendimentos/documentos/pendencias");
  if (!dados || !Array.isArray(dados.itens)) throw new Error("Resposta inválida da API de pendências.");
  return dados;
}

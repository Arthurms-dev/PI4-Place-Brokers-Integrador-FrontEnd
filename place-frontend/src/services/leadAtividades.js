import { api } from "@/lib/apiClient";

export async function listarAtividades(leadId) {
  return (await api.get(`/leads/${encodeURIComponent(leadId)}/atividades`)).atividades;
}

export async function registrarAtividade(leadId, dados) {
  return (await api.post(`/leads/${encodeURIComponent(leadId)}/atividades`, dados)).atividade;
}

/** Lembretes de retorno do corretor (atrasados e dos próximos 7 dias). */
export async function listarRetornos() {
  return (await api.get("/leads/retornos")).retornos ?? [];
}

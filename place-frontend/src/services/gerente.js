import { api } from "@/lib/apiClient";

export const getEquipe = () => api.get("/gerente/equipe");
export const getLeadsEquipe = async () => (await api.get("/gerente/leads")).leads;
export const getAgendaEquipe = async () => (await api.get("/gerente/agendamentos")).agendamentos;
export const reatribuirLead = async (id, corretorId) =>
  (await api.patch(`/gerente/leads/${id}/corretor`, { corretorId })).lead;
/** Leads parados e desempenho de atendimento nos últimos 30 dias. */
export const getDesempenho = () => api.get("/gerente/desempenho");

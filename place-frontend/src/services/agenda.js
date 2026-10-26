import { api } from "@/lib/apiClient";

export const listarAgendamentos = async () => (await api.get("/agendamentos")).agendamentos;
export const criarAgendamento = async (dados) => (await api.post("/agendamentos", dados)).agendamento;
export const remarcarAgendamento = async (id, dataHora) =>
  (await api.patch(`/agendamentos/${id}/data`, { dataHora })).agendamento;
export const atualizarStatusAgendamento = async (id, status, extra = {}) =>
  (await api.patch(`/agendamentos/${id}/status`, { status, ...extra })).agendamento;

import { api } from "@/lib/apiClient";

export const getAgendamentos = async () => (await api.get("/agendamentos")).agendamentos;

/** @param {{ tipo: string, dataHora: string, duracaoMinutos?: number, clienteId: string,
 * corretorId: string, empreendimentoId?: string, local?: string, observacoes?: string,
 * leadOrigemId?: string }} dados */
export const criarAgendamento = async (dados) => (await api.post("/agendamentos", dados)).agendamento;
export const remarcarAgendamento = async (id, dataHora) =>
  (await api.patch(`/agendamentos/${id}/data`, { dataHora })).agendamento;
export const atualizarStatusAgendamento = async (id, status, extra = {}) =>
  (await api.patch(`/agendamentos/${id}/status`, { status, ...extra })).agendamento;
export const getClientes = async () => (await api.get("/clientes")).clientes;
export const getEmpreendimentos = async () => {
  const dados = await api.get("/empreendimentos");
  return Array.isArray(dados) ? dados : dados?.empreendimentos ?? [];
};

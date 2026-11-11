import { api } from "@/lib/apiClient";

export const listarMeusLeads = async () => (await api.get("/leads/meus")).leads;
export const atualizarStatusLead = async (id, status) => (await api.patch(`/leads/${id}/status`, { status })).lead;
export const listarClientes = async () => (await api.get("/clientes")).clientes;
export const criarCliente = async (dados) => (await api.post("/clientes", dados)).cliente;
/** Leva o lead para a carteira (cria ou reaproveita o cliente) para agendar visita e lançar venda. */
export const levarLeadParaCarteira = async (leadId) => (await api.post(`/leads/${leadId}/cliente`)).cliente;

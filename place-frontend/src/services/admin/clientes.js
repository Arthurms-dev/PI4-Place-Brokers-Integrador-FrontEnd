import { api } from "@/lib/apiClient";

export const getClientes = async () => (await api.get("/clientes")).clientes;
export const getClienteById = async (id) => (await api.get(`/clientes/${id}`)).cliente;
/** @param {{ nome: string, email?: string, telefone: string, observacoes?: string, corretorId?: string, leadId?: string }} dados */
export const criarCliente = async (dados) => (await api.post("/clientes", dados)).cliente;
/** @param {string} id
 * @param {{ nome?: string, email?: string, telefone?: string, observacoes?: string, corretorId?: string }} dados */
export const atualizarCliente = async (id, dados) => (await api.patch(`/clientes/${id}`, dados)).cliente;

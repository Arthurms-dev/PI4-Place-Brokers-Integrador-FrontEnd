import { api } from "@/lib/apiClient";

export const getLeads = async () => (await api.get("/leads")).leads;
export const getCorretores = async () => (await api.get("/corretores")).corretores;
export const updateLeadStatus = async (id, status) => (await api.patch(`/leads/${id}/status`, { status })).lead;
export const assignLead = async (id, corretorId) => (await api.patch(`/leads/${id}/corretor`, { corretorId })).lead;
export const convertLeadToCliente = (id) => api.post(`/leads/${id}/converter`);

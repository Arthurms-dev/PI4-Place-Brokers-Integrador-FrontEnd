import { api } from "@/lib/apiClient";

/** Diretoria do diretor logado: equipes (com gerente) e corretores. */
export const getDiretoria = () => api.get("/diretor/diretoria");
export const getLeadsDiretoria = async () => (await api.get("/diretor/leads")).leads;
export const repassarLeadDiretoria = async (id, corretorId) =>
  (await api.patch(`/diretor/leads/${id}/corretor`, { corretorId })).lead;

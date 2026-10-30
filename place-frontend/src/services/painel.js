import { api } from "@/lib/apiClient";

export const getAvisosSeguranca = () => api.get("/painel/avisos-seguranca");
export const getMelhorias = () => api.get("/painel/melhorias");
export const getModificacoes = () => api.get("/painel/modificacoes");

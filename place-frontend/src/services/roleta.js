import { api } from "@/lib/apiClient";

// Recepção (admin)
export const carregarRoletaHoje = () => api.get("/roleta/hoje");
export const marcarChegada = (corretorId) => api.post("/roleta/chegada", { corretorId });
export const definirApto = (corretorId, apto) => api.patch(`/roleta/chegada/${encodeURIComponent(corretorId)}`, { apto });
export const removerChegada = (corretorId) => api.delete(`/roleta/chegada/${encodeURIComponent(corretorId)}`);
export const iniciarRoleta = () => api.post("/roleta/iniciar", {});
export const distribuirAgora = () => api.post("/roleta/distribuir", {});

// Corretor
export const minhaRoleta = () => api.get("/roleta/minha");

// Focos (gerente na própria equipe; admin em todos)
export const listarFocos = () => api.get("/roleta/focos");
export const salvarFocos = (corretorId, empreendimentoIds) =>
  api.put(`/roleta/focos/${encodeURIComponent(corretorId)}`, { empreendimentoIds });

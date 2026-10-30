import { api } from "@/lib/apiClient";

export const listarMembros = () => api.get("/equipe");
export const atualizarMembro = (id, mudancas) => api.patch(`/equipe/${id}`, mudancas);
export const criarGerente = (dados) => api.post("/equipe/gerentes", dados);
export const listarTimes = () => api.get("/equipe/times");
export const criarTime = (dados) => api.post("/equipe/times", dados);
export const atualizarTime = (id, dados) => api.patch(`/equipe/times/${id}`, dados);
export const removerTime = (id) => api.delete(`/equipe/times/${id}`);
export const listarDiretorias = () => api.get("/equipe/diretorias");
export const criarDiretoria = (dados) => api.post("/equipe/diretorias", dados);

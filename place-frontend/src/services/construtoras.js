import { api } from "@/lib/apiClient";

export const listarConstrutoras = () => api.get("/construtoras", { auth: false });
/** @param {{ nome: string, logoUrl?: string, site?: string }} dados */
export const criarConstrutora = ({ nome, logoUrl, site }) =>
  api.post("/construtoras", { nome, logoUrl: logoUrl ?? null, site: site ?? null });

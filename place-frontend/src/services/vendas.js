import { api } from "@/lib/apiClient";

export const listarVendas = () => api.get("/vendas");
export const criarVenda = (dados) => api.post("/vendas", dados);
export const decidirVenda = (id, status) => api.patch(`/vendas/${id}`, { status });

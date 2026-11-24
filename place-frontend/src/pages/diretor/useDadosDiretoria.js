import { useEffect, useState } from "react";
import { getDiretoria, getLeadsDiretoria } from "@/services/diretor";
import { listarVendas } from "@/services/vendas";

export function useDadosDiretoria() {
  const [estado, setEstado] = useState({ diretoria: null, equipes: [], membros: [], leads: [], vendas: [], carregando: true, erro: "" });

  useEffect(() => {
    let ativo = true;
    Promise.all([getDiretoria(), getLeadsDiretoria().catch(() => []), listarVendas().catch(() => [])])
      .then(([d, leads, vendas]) => ativo && setEstado({ ...d, leads, vendas, carregando: false, erro: "" }))
      .catch((e) => ativo && setEstado((s) => ({ ...s, carregando: false, erro: e.message })));
    return () => {
      ativo = false;
    };
  }, []);

  const atualizarLead = (lead) => setEstado((s) => ({ ...s, leads: s.leads.map((l) => (l.id === lead.id ? lead : l)) }));
  return { ...estado, atualizarLead };
}

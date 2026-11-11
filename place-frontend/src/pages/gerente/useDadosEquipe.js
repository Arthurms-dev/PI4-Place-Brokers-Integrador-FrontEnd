import { useEffect, useState } from "react";
import { getAgendaEquipe, getEquipe, getLeadsEquipe } from "@/services/gerente";
import { listarVendas } from "@/services/vendas";

export function useDadosEquipe() {
  const [estado, setEstado] = useState({ equipes: [], membros: [], leads: [], vendas: [], agenda: [], carregando: true, erro: "" });

  useEffect(() => {
    let ativo = true;
    Promise.all([getEquipe(), getLeadsEquipe().catch(() => []), listarVendas().catch(() => []), getAgendaEquipe().catch(() => [])])
      .then(([eq, leads, vendas, agenda]) => ativo && setEstado({ equipes: eq.equipes, membros: eq.membros, leads, vendas, agenda, carregando: false, erro: "" }))
      .catch((e) => ativo && setEstado((s) => ({ ...s, carregando: false, erro: e.message })));
    return () => {
      ativo = false;
    };
  }, []);

  const atualizarLead = (lead) => setEstado((s) => ({ ...s, leads: s.leads.map((l) => (l.id === lead.id ? lead : l)) }));

  return { ...estado, atualizarLead };
}
import { onlyDigits } from "./contact.js";

const DAY_MS = 86_400_000;
const PERIOD_DAYS = { todos: null, "7d": 7, "30d": 30 };

export const DEFAULT_FILTERS = {
  search: "",
  status: "todos",
  empreendimento: "todos",
  corretor: "todos",
  periodo: "todos", 
};

export function filterLeads(leads, filters, now = Date.now()) {
  const query = filters.search.trim().toLowerCase();
  const queryDigits = onlyDigits(query);
  const days = PERIOD_DAYS[filters.periodo];

  return leads
    .filter((lead) => {
      if (filters.status !== "todos" && lead.status !== filters.status) return false;
      if (filters.empreendimento !== "todos" && lead.empreendimento?.id !== filters.empreendimento) return false;
      if (filters.corretor === "sem" && lead.corretor) return false;
      if (filters.corretor !== "todos" && filters.corretor !== "sem" && lead.corretor?.id !== filters.corretor) {
        return false;
      }
      if (days && now - new Date(lead.criadoEm).getTime() > days * DAY_MS) return false;

      if (query) {
        const text = [lead.nome, lead.email, lead.telefone].filter(Boolean).join(" ").toLowerCase();
        const matchesText = text.includes(query);
        const matchesPhone = queryDigits && onlyDigits(lead.telefone ?? "").includes(queryDigits);
        if (!matchesText && !matchesPhone) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
}
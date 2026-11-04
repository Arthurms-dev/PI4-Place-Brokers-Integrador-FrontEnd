// Sino de leads novos na barra do corretor: o que conta e o que é "chegou agora".

/** Leads ainda sem atendimento, os mais recentes primeiro. */
export function leadsAguardando(leads = []) {
  return leads
    .filter((l) => l?.status === "novo")
    .sort((a, b) => new Date(b.atribuidoEm ?? b.criadoEm) - new Date(a.atribuidoEm ?? a.criadoEm));
}

/** Leads novos que não estavam na consulta anterior (para o aviso na tela). Na primeira consulta, nenhum. */
export function chegaramAgora(anteriores, atuais) {
  if (!anteriores) return [];
  const vistos = new Set(anteriores.map((l) => l.id));
  return atuais.filter((l) => !vistos.has(l.id));
}

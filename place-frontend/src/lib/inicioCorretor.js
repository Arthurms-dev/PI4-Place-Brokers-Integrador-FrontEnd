// Números do Início do corretor, calculados a partir do que as telas já carregam.

const inicioDaSemana = (agora) => {
  const d = new Date(agora);
  d.setHours(0, 0, 0, 0);
  const diaSemana = (d.getDay() + 6) % 7; // segunda = 0
  d.setDate(d.getDate() - diaSemana);
  return d;
};

/**
 * @param {{ leads?: object[], agendamentos?: object[], vendas?: object[], agora?: Date }} dados
 */
export function resumirInicio({ leads = [], agendamentos = [], vendas = [], agora = new Date() } = {}) {
  const ini = inicioDaSemana(agora);
  const fim = new Date(ini);
  fim.setDate(fim.getDate() + 7);

  const visitas = agendamentos.filter((a) => {
    const t = new Date(a.dataHora);
    return a.tipo === "visita_imovel" && a.status !== "cancelado" && t >= ini && t < fim;
  });
  const soma = (l) => l.reduce((total, v) => total + Number(v.valor || 0), 0);
  const confirmadas = vendas.filter((v) => v.status === "confirmada");
  const pendentes = vendas.filter((v) => v.status === "pendente");

  return {
    leadsNovos: leads.filter((l) => l.status === "novo").length,
    leadsEmAtendimento: leads.filter((l) => l.status === "em_atendimento").length,
    visitasSemana: visitas.length,
    visitasPendentes: visitas.filter((a) => new Date(a.dataHora) >= agora && a.status !== "realizado" && a.status !== "nao_compareceu").length,
    vgvConfirmado: soma(confirmadas),
    vendasConfirmadas: confirmadas.length,
    vendasPendentes: pendentes.length,
    valorPendente: soma(pendentes),
  };
}

/** Cruza os acessos registrados com a lista de empreendimentos (ignora os que saíram do catálogo). */
export function ultimosAcessos(acessos = [], empreendimentos = [], quantidade = 3) {
  const porId = new Map(empreendimentos.map((e) => [String(e.id), e]));
  return acessos
    .map((a) => porId.get(String(a.empreendimentoId)))
    .filter(Boolean)
    .slice(0, quantidade);
}

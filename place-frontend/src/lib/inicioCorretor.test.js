import { describe, expect, it } from "vitest";
import { leadsEsperando, resumirInicio, ultimosAcessos } from "./inicioCorretor";

const agora = new Date("2026-10-28T15:00:00"); // quarta-feira

describe("resumirInicio", () => {
  it("conta leads novos, visitas da semana (seg a dom, sem canceladas) e VGV confirmado", () => {
    const r = resumirInicio({
      agora,
      leads: [{ status: "novo" }, { status: "novo" }, { status: "em_atendimento" }, { status: "perdido" }],
      agendamentos: [
        { tipo: "visita_imovel", status: "realizado", dataHora: "2026-10-26T10:00:00" }, // segunda
        { tipo: "visita_imovel", status: "agendado", dataHora: "2026-11-01T10:00:00" }, // domingo
        { tipo: "visita_imovel", status: "cancelado", dataHora: "2026-10-29T10:00:00" },
        { tipo: "reuniao_escritorio", status: "agendado", dataHora: "2026-10-29T10:00:00" },
        { tipo: "visita_imovel", status: "agendado", dataHora: "2026-11-02T10:00:00" }, // próxima semana
      ],
      vendas: [
        { status: "confirmada", valor: 250000 },
        { status: "confirmada", valor: "199600" },
        { status: "pendente", valor: 300000 },
        { status: "recusada", valor: 100000 },
      ],
    });
    expect(r).toMatchObject({
      leadsNovos: 2, leadsEmAtendimento: 1, visitasSemana: 2, visitasPendentes: 1,
      vgvConfirmado: 449600, vendasConfirmadas: 2, vendasPendentes: 1, valorPendente: 300000,
    });
  });

  it("sem dados, tudo zero", () => {
    expect(resumirInicio({ agora })).toMatchObject({ leadsNovos: 0, visitasSemana: 0, vgvConfirmado: 0 });
  });
});

describe("ultimosAcessos", () => {
  it("mantém a ordem dos acessos e ignora empreendimento que saiu do catálogo", () => {
    const lista = [{ id: "a", nome: "A" }, { id: "b", nome: "B" }, { id: "c", nome: "C" }];
    const r = ultimosAcessos([{ empreendimentoId: "c" }, { empreendimentoId: "x" }, { empreendimentoId: "a" }], lista);
    expect(r.map((e) => e.nome)).toEqual(["C", "A"]);
  });

  it("leads esperando: só os novos, quem espera há mais tempo primeiro, sem os já atendidos", () => {
    const leads = [
      { id: "1", status: "novo", criadoEm: "2026-10-28T14:50:00" },
      { id: "2", status: "em_atendimento", criadoEm: "2026-10-28T10:00:00" },
      { id: "3", status: "novo", criadoEm: "2026-10-28T14:10:00" },
      { id: "4", status: "novo", criadoEm: "2026-10-28T14:30:00" },
    ];
    expect(leadsEsperando(leads, new Set(["4"])).map((l) => l.id)).toEqual(["3", "1"]);
  });
});

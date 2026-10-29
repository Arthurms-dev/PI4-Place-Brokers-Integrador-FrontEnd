// Textos da roleta de leads para as telas (mesmas regras do back).

const FUSO = "America/Recife";

/** "08:42" no horário de Recife. */
export function horaRecife(iso) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

/** "quinta-feira, 29 de outubro" */
export function diaPorExtenso(dia) {
  if (!dia) return "";
  const [a, m, d] = dia.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(new Date(Date.UTC(a, m - 1, d)));
}

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

/**
 * Card "Roleta de hoje" do corretor.
 * @returns {{ tom: "ok" | "aviso" | "neutro", titulo: string, detalhe: string } | null}
 */
export function situacaoDoCorretor(minha) {
  if (!minha) return null;
  const { chegada, horario, iniciada, recebidosHoje = 0 } = minha;
  const situacao = horario?.situacao;

  if (!chegada) {
    if (situacao === "chegada") {
      return { tom: "aviso", titulo: "Você ainda não está na lista de hoje", detalhe: "Avise a recepção quando chegar. A lista fecha às 09h." };
    }
    if (situacao === "distribuindo") {
      return { tom: "neutro", titulo: "Você não está na roleta de hoje", detalhe: "A lista de chegada fechou às 09h." };
    }
    return null;
  }

  if (!chegada.apto) {
    return {
      tom: "neutro",
      titulo: `Chegou às ${horaRecife(chegada.chegouEm)}, depois do fechamento da lista`,
      detalhe: "Hoje você não recebe leads da roleta. Leads que já são seus continuam com você.",
    };
  }

  const recebidos = recebidosHoje > 0 ? ` · ${plural(recebidosHoje, "lead recebido", "leads recebidos")} hoje` : "";
  return {
    tom: "ok",
    titulo: `Roleta de hoje: você é o nº ${chegada.ordem}`,
    detalhe: `Chegou às ${horaRecife(chegada.chegouEm)}${recebidos}. ${
      iniciada ? "A roleta está distribuindo: fique de olho em Meus leads." : "A distribuição começa quando a lista fechar, às 09h."
    }`,
  };
}

/** Por que um lead ainda está sem corretor, para a recepção entender. */
export function motivoAguardando(painel) {
  if (!painel) return "";
  if (painel.horario?.situacao === "fechada") return painel.horario.mensagem;
  if (!painel.iniciada) return "Esperando a lista fechar (às 09h ou no botão).";
  return "Sem corretor apto com foco no empreendimento (ou lead sem empreendimento). Atribua manualmente em Leads.";
}

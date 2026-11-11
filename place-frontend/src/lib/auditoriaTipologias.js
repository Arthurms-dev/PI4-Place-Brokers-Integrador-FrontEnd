// Compara cada planta cadastrada apenas com os limites gerais preenchidos.
// Não infere valores ausentes nem altera os dados persistidos.
const CAMPOS = [
  { planta: "quartos", minimo: "quartosMin", maximo: "quartosMax", unidade: "quartos", singular: "quarto" },
  { planta: "vagas", minimo: "vagasMin", maximo: "vagasMax", unidade: "vagas", singular: "vaga" },
  { planta: "area_m2", minimo: "areaMin", maximo: "areaMax", unidade: "m²" },
];

function numeroValido(valor) {
  if (valor == null || valor === "" || (typeof valor === "string" && !valor.trim())) {
    return null;
  }

  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

const formatar = (numero) =>
  numero.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

function comUnidade(valor, campo) {
  const unidade = valor === 1 ? (campo.singular ?? campo.unidade) : campo.unidade;
  return `${formatar(valor)} ${unidade}`;
}

function descreverFaixa(minimo, maximo, campo) {
  if (minimo != null && maximo != null) {
    return minimo === maximo
      ? comUnidade(minimo, campo)
      : `${formatar(minimo)} a ${comUnidade(maximo, campo)}`;
  }
  if (minimo != null) return `a partir de ${comUnidade(minimo, campo)}`;
  return `até ${comUnidade(maximo, campo)}`;
}

export function auditarTipologias(gerais, tipologias) {
  if (!Array.isArray(tipologias) || !tipologias.length) return [];

  const avisos = [];

  for (const [indice, planta] of tipologias.entries()) {
    if (!planta || typeof planta !== "object") continue;

    const nome = String(planta.nome || `Planta ${indice + 1}`);

    for (const campo of CAMPOS) {
      const valor = numeroValido(planta[campo.planta]);
      const minimo = numeroValido(gerais?.[campo.minimo]);
      const maximo = numeroValido(gerais?.[campo.maximo]);

      // Campo incompleto, sem dado verificável ou faixa geral inválida:
      // não gerar alerta baseado em suposições.
      if (valor == null || (minimo == null && maximo == null)) continue;
      if (minimo != null && maximo != null && minimo > maximo) continue;
      if (campo.planta === "area_m2" && valor === 0) continue;

      const abaixo = minimo != null && valor < minimo;
      const acima = maximo != null && valor > maximo;

      if (!abaixo && !acima) continue;

      avisos.push({
        chave: `${indice}-${campo.planta}`,
        mensagem: `${nome}: ${comUnidade(valor, campo)} está fora da faixa geral de ${descreverFaixa(minimo, maximo, campo)}.`,
      });
    }
  }

  return avisos;
}

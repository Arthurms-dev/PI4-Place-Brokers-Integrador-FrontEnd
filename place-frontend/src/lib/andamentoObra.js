// Andamento da obra por módulo/torre (o cadastro informa todo mês, como a construtora publica).
// O corretor vê sempre (com aviso quando passa de 60 dias). O cliente vê no material exclusivo
// (depois do cadastro), só medição de até 60 dias e só enquanto a obra não terminou.

export const DIAS_PARA_DESATUALIZAR = 60;

const numero = (v) => (v == null || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));

/** "2026-08-01" → "ago/2026" */
export function textoMes(iso) {
  const [ano, mes] = String(iso ?? "").slice(0, 7).split("-").map(Number);
  if (!ano || !mes) return "";
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${nome}/${ano}`;
}

/** Dias desde o fim do mês da medição (a medição de agosto vale até 31/08). */
export function diasDesdeMedicao(iso, hoje = new Date()) {
  const [ano, mes] = String(iso ?? "").slice(0, 7).split("-").map(Number);
  if (!ano || !mes) return null;
  const fimDoMes = new Date(ano, mes, 0, 23, 59, 59);
  return Math.max(0, Math.floor((hoje - fimDoMes) / 86_400_000));
}

/**
 * @returns {null | { modulos: {modulo:string, percentual:number}[], mes: string, dias: number|null,
 *                    desatualizado: boolean, fonte: string|null }}
 */
export function lerAndamento(emp, hoje = new Date()) {
  const modulos = (Array.isArray(emp?.andamento_obra) ? emp.andamento_obra : [])
    .map((m) => ({ modulo: String(m?.modulo ?? "").trim(), percentual: numero(m?.percentual) }))
    .filter((m) => m.modulo && m.percentual != null && m.percentual >= 0 && m.percentual <= 100);
  if (!modulos.length) return null;
  const dias = diasDesdeMedicao(emp.andamento_referencia, hoje);
  return {
    modulos,
    mes: textoMes(emp.andamento_referencia),
    dias,
    desatualizado: dias == null || dias > DIAS_PARA_DESATUALIZAR,
    fonte: emp.andamento_fonte_url ?? null,
  };
}

/** O que o cliente cadastrado vê: nada se a medição estiver velha ou se já estiver pronto. */
export function andamentoParaCliente(emp, hoje = new Date()) {
  if (!emp || emp.status === "pronto") return null;
  const a = lerAndamento(emp, hoje);
  return a && !a.desatualizado ? a : null;
}

export const textoPercentual = (v) => `${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;

// Ficha técnica e registro da incorporação para a página do empreendimento.
// Só entra o que foi cadastrado; nada é estimado.

const inteiro = (v) => (Number.isInteger(Number(v)) && Number(v) > 0 ? Number(v) : null);
const plural = (n, um, varios) => `${n.toLocaleString("pt-BR")} ${n === 1 ? um : varios}`;

/**
 * @param {object|null} emp linha do empreendimento vinda da API
 * @returns {{ itens: [string, string][], registro: string|null }}
 */
export function fichaTecnica(emp) {
  if (!emp) return { itens: [], registro: null };
  const torres = inteiro(emp.torres);
  const andares = inteiro(emp.andares);
  const porAndar = inteiro(emp.aptos_por_andar);
  const unidades = inteiro(emp.unidades_total);
  const elevadores = Number.isInteger(Number(emp.elevadores_por_torre)) && emp.elevadores_por_torre != null ? Number(emp.elevadores_por_torre) : null;
  const terreno = Number(emp.area_terreno_m2) > 0 ? Number(emp.area_terreno_m2) : null;

  const itens = [];
  if (torres) itens.push(["Torres", plural(torres, "torre", "torres")]);
  if (andares) itens.push(["Andares", torres && torres > 1 ? `${plural(andares, "andar", "andares")} por torre` : plural(andares, "andar", "andares")]);
  if (porAndar) itens.push(["Por andar", plural(porAndar, "apartamento", "apartamentos")]);
  if (unidades) itens.push(["Unidades", plural(unidades, "unidade", "unidades")]);
  if (elevadores != null) itens.push(["Elevadores", elevadores === 0 ? "Sem elevador" : `${plural(elevadores, "elevador", "elevadores")}${torres && torres > 1 ? " por torre" : ""}`]);
  if (terreno) itens.push(["Terreno", `${terreno.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} m²`]);

  let registro = null;
  const numero = String(emp.registro_incorporacao ?? "").trim();
  if (numero) {
    const cartorio = String(emp.registro_cartorio ?? "").trim();
    const data = /^\d{4}-\d{2}-\d{2}/.test(String(emp.registro_data ?? ""))
      ? String(emp.registro_data).slice(0, 10).split("-").reverse().join("/")
      : "";
    registro = `Incorporação registrada: ${numero}${cartorio ? `, ${cartorio}` : ""}${data ? `, em ${data}` : ""}.`;
  }
  return { itens, registro };
}

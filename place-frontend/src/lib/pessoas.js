// Nomes repetidos nas listas (ex.: "Bruno" corretor e "Bruno" admin, duas "Juliana Almeida")
// confundiam quem escolhe. Só quando o nome se repete entra um detalhe para separar.

const normalizar = (s = "") => String(s).trim().toLocaleLowerCase("pt-BR");

/**
 * @param {{ nome: string, email?: string, telefone?: string, cargo?: string }[]} lista
 * @returns {(pessoa: object) => string} função que dá o rótulo de cada pessoa da lista
 */
export function rotuladorDePessoas(lista = []) {
  const contagem = new Map();
  for (const p of lista) contagem.set(normalizar(p.nome), (contagem.get(normalizar(p.nome)) ?? 0) + 1);
  return (p) => {
    const nome = p.nome ?? "";
    const extras = [];
    if (p.cargo === "admin") extras.push("admin");
    if ((contagem.get(normalizar(nome)) ?? 0) > 1) {
      const fone = String(p.telefone ?? "").replace(/\D/g, "");
      if (p.email) extras.push(p.email);
      else if (fone.length >= 4) extras.push(`final ${fone.slice(-4)}`);
    }
    return extras.length ? `${nome} (${extras.join(" · ")})` : nome;
  };
}

/** Filtra por nome, e-mail ou telefone, sem acento. */
export function filtrarPessoas(lista = [], busca = "") {
  const q = normalizar(busca).normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (!q) return lista;
  return lista.filter((p) =>
    `${p.nome ?? ""} ${p.email ?? ""} ${String(p.telefone ?? "")}`.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(q),
  );
}

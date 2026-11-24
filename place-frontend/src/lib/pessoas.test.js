import { describe, expect, it } from "vitest";
import { filtrarPessoas, rotuladorDePessoas } from "./pessoas";

describe("rotuladorDePessoas", () => {
  it("só acrescenta detalhe quando o nome se repete", () => {
    const lista = [
      { id: 1, nome: "Bruno", email: "bruno@a.com", cargo: "corretor" },
      { id: 2, nome: "Bruno", email: "bruno@b.com", cargo: "admin" },
      { id: 3, nome: "Jean", email: "jean@a.com", cargo: "corretor" },
    ];
    const rotulo = rotuladorDePessoas(lista);
    expect(rotulo(lista[0])).toBe("Bruno (bruno@a.com)");
    expect(rotulo(lista[1])).toBe("Bruno (admin · bruno@b.com)");
    expect(rotulo(lista[2])).toBe("Jean");
  });

  it("cliente repetido sem e-mail usa o final do telefone", () => {
    const lista = [{ nome: "Juliana Almeida", telefone: "81986288250" }, { nome: "juliana almeida", telefone: "81972398066" }];
    expect(rotuladorDePessoas(lista)(lista[0])).toBe("Juliana Almeida (final 8250)");
  });
});

describe("filtrarPessoas", () => {
  it("acha por nome sem acento, e-mail ou telefone", () => {
    const lista = [{ nome: "Vitória Ramos", email: "v@x.com", telefone: "81983000000" }, { nome: "Jean" }];
    expect(filtrarPessoas(lista, "vitoria")).toHaveLength(1);
    expect(filtrarPessoas(lista, "83000")).toHaveLength(1);
    expect(filtrarPessoas(lista, "")).toHaveLength(2);
  });
});

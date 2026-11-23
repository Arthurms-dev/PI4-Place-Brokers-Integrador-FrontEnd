import { describe, expect, it } from "vitest";
import { deveVoltarAoTopo } from "./rolagem";

describe("deveVoltarAoTopo", () => {
  it("abre no topo ao trocar de página pelo menu ou por um link", () => {
    expect(deveVoltarAoTopo({ anterior: "/", atual: "/sobre", tipo: "PUSH" })).toBe(true);
    expect(deveVoltarAoTopo({ anterior: "/sobre", atual: "/contato", tipo: "PUSH" })).toBe(true);
    expect(deveVoltarAoTopo({ anterior: "/prontos", atual: "/", tipo: "REPLACE" })).toBe(true);
  });

  it("não mexe ao voltar/avançar no navegador (ele devolve a posição)", () => {
    expect(deveVoltarAoTopo({ anterior: "/sobre", atual: "/", tipo: "POP" })).toBe(false);
  });

  it("não mexe quando o próprio destino vai rolar até uma seção", () => {
    expect(deveVoltarAoTopo({ anterior: "/", atual: "/prontos", tipo: "PUSH", hash: "#vender" })).toBe(false);
    expect(deveVoltarAoTopo({ anterior: "/sobre", atual: "/", tipo: "PUSH", rolar: "lista" })).toBe(false);
  });

  it("abrir e fechar o modal do empreendimento mantém a home onde estava", () => {
    expect(deveVoltarAoTopo({ anterior: "/", atual: "/imoveis/abc", tipo: "PUSH" })).toBe(false);
    expect(deveVoltarAoTopo({ anterior: "/imoveis/abc", atual: "/", tipo: "PUSH" })).toBe(false);
  });

  it("sem troca de página, nada a fazer", () => {
    expect(deveVoltarAoTopo({ anterior: "/prontos", atual: "/prontos", tipo: "PUSH" })).toBe(false);
  });
});

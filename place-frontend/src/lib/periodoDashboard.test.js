import { describe, expect, it } from "vitest";
import { intervaloDoFiltro, rotuloDoIntervalo } from "./periodoDashboard";

const HOJE = new Date(2026, 10, 17, 15, 0); // 17/11/2026

describe("período do dashboard", () => {
  it("últimos 7 dias contam hoje", () => {
    expect(intervaloDoFiltro({ tipo: "dias", dias: 7 }, HOJE)).toEqual({ ok: true, de: "2026-11-11", ate: "2026-11-17" });
  });

  it("mês fechado vai do dia 1 ao último dia", () => {
    expect(intervaloDoFiltro({ tipo: "mes", mes: "2026-02" }, HOJE)).toEqual({ ok: true, de: "2026-02-01", ate: "2026-02-28" });
  });

  it("mês atual vai só até hoje", () => {
    expect(intervaloDoFiltro({ tipo: "mes", mes: "2026-11" }, HOJE)).toEqual({ ok: true, de: "2026-11-01", ate: "2026-11-17" });
  });

  it("mês futuro não vale", () => {
    expect(intervaloDoFiltro({ tipo: "mes", mes: "2026-12" }, HOJE).ok).toBe(false);
  });

  it("datas: corta o fim em hoje e recusa invertidas ou acima de 1 ano", () => {
    expect(intervaloDoFiltro({ tipo: "datas", de: "2026-10-01", ate: "2026-12-31" }, HOJE)).toEqual({ ok: true, de: "2026-10-01", ate: "2026-11-17" });
    expect(intervaloDoFiltro({ tipo: "datas", de: "2026-11-10", ate: "2026-11-01" }, HOJE)).toMatchObject({ ok: false, erro: "A data inicial vem depois da final." });
    expect(intervaloDoFiltro({ tipo: "datas", de: "2025-01-01", ate: "2026-11-17" }, HOJE)).toMatchObject({ ok: false, erro: "O período máximo é de 1 ano." });
    expect(intervaloDoFiltro({ tipo: "datas", de: "", ate: "2026-11-17" }, HOJE).ok).toBe(false);
  });

  it("rótulo legível", () => {
    expect(rotuloDoIntervalo({ de: "2026-11-01", ate: "2026-11-17" })).toMatch(/^1 a 17 de nov\.? de 2026$/);
  });
});

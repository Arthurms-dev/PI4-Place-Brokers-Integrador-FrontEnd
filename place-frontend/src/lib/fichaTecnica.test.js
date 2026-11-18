import { describe, expect, it } from "vitest";
import { fichaTecnica } from "./fichaTecnica";

describe("ficha técnica do empreendimento", () => {
  it("monta só o que foi cadastrado, com plural e 'por torre' quando há mais de uma", () => {
    const { itens, registro } = fichaTecnica({
      torres: 2, andares: 36, aptos_por_andar: 8, unidades_total: 576, elevadores_por_torre: 6, area_terreno_m2: "12500.5",
      registro_incorporacao: "R-5 da matrícula 12.345", registro_cartorio: "1º Registro de Imóveis do Recife", registro_data: "2026-05-12",
    });
    expect(itens).toEqual([
      ["Torres", "2 torres"],
      ["Andares", "36 andares por torre"],
      ["Por andar", "8 apartamentos"],
      ["Unidades", "576 unidades"],
      ["Elevadores", "6 elevadores por torre"],
      ["Terreno", "12.500,5 m²"],
    ]);
    expect(registro).toBe("Incorporação registrada: R-5 da matrícula 12.345, 1º Registro de Imóveis do Recife, em 12/05/2026.");
  });

  it("torre única, sem elevador e sem registro", () => {
    const { itens, registro } = fichaTecnica({ torres: 1, andares: 4, elevadores_por_torre: 0 });
    expect(itens).toEqual([["Torres", "1 torre"], ["Andares", "4 andares"], ["Elevadores", "Sem elevador"]]);
    expect(registro).toBe(null);
  });

  it("nada cadastrado: nada aparece", () => {
    expect(fichaTecnica({})).toEqual({ itens: [], registro: null });
    expect(fichaTecnica(null)).toEqual({ itens: [], registro: null });
  });
});

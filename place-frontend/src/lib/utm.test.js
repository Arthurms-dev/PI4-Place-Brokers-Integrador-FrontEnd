import { afterEach, describe, expect, it } from "vitest";
import { capturarUtms, linhaDeOrigem, utmsDaSessao, utmsDaUrl } from "./utm";

describe("utm", () => {
  afterEach(() => window.sessionStorage.clear());

  it("lê só os utm_* conhecidos e ignora os vazios", () => {
    expect(utmsDaUrl("?utm_source=instagram&utm_medium=&utm_campaign=lanc-nov&outro=1"))
      .toEqual({ utm_source: "instagram", utm_campaign: "lanc-nov" });
    expect(utmsDaUrl("?q=boa+viagem")).toBeNull();
  });

  it("guarda na sessão e não apaga a campanha ao navegar sem utm", () => {
    capturarUtms("?utm_source=facebook&utm_campaign=place");
    capturarUtms("");
    expect(utmsDaSessao()).toEqual({ utm_source: "facebook", utm_campaign: "place" });
  });

  it("corta texto longo e caracteres de controle", () => {
    capturarUtms(`?utm_term=${"a".repeat(150)}%0Ab`);
    expect(utmsDaSessao().utm_term).toHaveLength(100);
    expect(utmsDaUrl("?utm_source=x%0Ay").utm_source).toBe("x y");
  });

  it("monta a linha de origem na ordem dos campos", () => {
    expect(linhaDeOrigem({ utm_campaign: "c", utm_source: "s" })).toBe("Origem: utm_source=s, utm_campaign=c");
    expect(linhaDeOrigem(null)).toBe("");
  });
});

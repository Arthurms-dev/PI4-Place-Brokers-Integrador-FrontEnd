import { describe, expect, it } from "vitest";
import { linkGoogleMaps } from "./localizacao";

describe("link do Google Maps", () => {
  it("ponto conferido vai pela coordenada", () => {
    expect(linkGoogleMaps({ latitude: -8.1, longitude: -34.9 })).toBe("https://www.google.com/maps/search/?api=1&query=-8.1,-34.9");
  });
  it("ponto aproximado busca pelo nome e endereço", () => {
    expect(linkGoogleMaps({ nome: "Parc College", bairro: "Boa Viagem", cidade: "Recife", uf: "PE", latitude: -8.1, longitude: -34.9, aproximada: true }))
      .toBe("https://www.google.com/maps/search/?api=1&query=Parc%20College%2C%20Boa%20Viagem%2C%20Recife%20-%20PE");
  });
});

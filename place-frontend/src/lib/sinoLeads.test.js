import { describe, expect, it } from "vitest";
import { chegaramAgora, leadsAguardando } from "./sinoLeads";

describe("sino de leads", () => {
  const leads = [
    { id: "a", status: "novo", criadoEm: "2026-11-04T10:00:00Z" },
    { id: "b", status: "em_atendimento", criadoEm: "2026-11-04T11:00:00Z" },
    { id: "c", status: "novo", atribuidoEm: "2026-11-04T12:00:00Z", criadoEm: "2026-11-04T09:00:00Z" },
  ];
  it("conta só os leads sem atendimento, o mais recente primeiro", () => {
    expect(leadsAguardando(leads).map((l) => l.id).join(",")).toBe("c,a");
  });
  it("na primeira consulta não avisa nada; depois avisa só o que é novo", () => {
    expect(chegaramAgora(null, leadsAguardando(leads)).length).toBe(0);
    const antes = [{ id: "a" }];
    expect(chegaramAgora(antes, leadsAguardando(leads)).map((l) => l.id).join(",")).toBe("c");
  });
});

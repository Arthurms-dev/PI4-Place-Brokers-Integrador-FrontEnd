import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { Delta } from "./Delta";

afterEach(cleanup);

describe("Delta", () => {
  it("mostra a variação com vírgula, como em português", () => {
    const { container } = render(<Delta value={126.6} />);
    expect(container.textContent).toBe("126,6%");
  });

  it("queda aparece sem o sinal de menos (a seta já indica)", () => {
    const { container } = render(<Delta value={-12.5} />);
    expect(container.textContent).toBe("12,5%");
  });
});

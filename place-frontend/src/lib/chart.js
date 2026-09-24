export function niceScale(peak, tickCount = 4, fallbackMax = 100) {
  if (peak <= 0) {
    return {
      max: fallbackMax,
      ticks: Array.from({ length: tickCount + 1 }, (_, i) => (fallbackMax / tickCount) * i),
    };
  }
  const rough = peak / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 10 * magnitude;
  return {
    max: step * tickCount,
    ticks: Array.from({ length: tickCount + 1 }, (_, i) => step * i),
  };
}

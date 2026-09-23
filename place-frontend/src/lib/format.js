const TZ = "America/Sao_Paulo";

export function formatNumber(value, maxFractionDigits = 0) {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: maxFractionDigits });
}

/** "2025-04-30" -> "30/04" */
export function formatShortDate(iso) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

/** "2025-04-30" -> "30/04/2025" */
export function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** ISO 8601 -> "30/04/2025 14:32" */
export function formatDateTime(iso) {
  const date = new Date(iso);
  const day = date.toLocaleDateString("pt-BR", { timeZone: TZ });
  const time = date.toLocaleTimeString("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  return `${day} ${time}`;
}

export function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

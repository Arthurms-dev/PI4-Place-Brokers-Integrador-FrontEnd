export function onlyDigits(value = "") {
  return value.replace(/\D/g, "");
}

export function formatPhone(value) {
  const d = onlyDigits(value ?? "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return value ?? "";
}

export function whatsappUrl(phone) {
  let d = onlyDigits(phone ?? "");
  if (!d) return null;
  if (d.length <= 11) d = `55${d}`;
  return `https://wa.me/${d}`;
}
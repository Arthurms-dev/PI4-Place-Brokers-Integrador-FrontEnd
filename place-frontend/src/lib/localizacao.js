// Localização dos empreendimentos: quando o ponto é aproximado (centro do bairro ou da rua),
// o site avisa e o Google Maps busca pelo endereço em vez de cravar o ponto.

/**
 * @param {{ nome?: string, endereco?: string, bairro?: string, cidade?: string, uf?: string,
 *   latitude?: number|null, longitude?: number|null, aproximada?: boolean }} local
 */
export function linkGoogleMaps({ nome, endereco, bairro, cidade, uf, latitude, longitude, aproximada }) {
  const base = "https://www.google.com/maps/search/?api=1&query=";
  if (!aproximada && latitude != null && longitude != null) return `${base}${latitude},${longitude}`;
  const texto = [nome, endereco, bairro, cidade && (uf ? `${cidade} - ${uf}` : cidade)].filter(Boolean).join(", ");
  return `${base}${encodeURIComponent(texto)}`;
}

export const AVISO_APROXIMADA = "Localização aproximada (bairro). Confirme o endereço com o corretor.";

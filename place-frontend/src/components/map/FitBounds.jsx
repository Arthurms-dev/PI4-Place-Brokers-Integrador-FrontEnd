import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function FitBounds({ pontos }) {
  const map = useMap();
  useEffect(() => {
    if (pontos.length) map.fitBounds(pontos.map((p) => [p.latitude, p.longitude]), { padding: [40, 40], maxZoom: 15 });
  }, [pontos, map]);
  return null;
}
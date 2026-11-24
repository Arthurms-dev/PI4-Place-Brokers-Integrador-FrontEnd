import { Fragment, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { Marker, Popup, useMap } from "react-leaflet";

const RAIO = 44; // px na tela: pinos mais próximos que isso viram um grupo
const ZOOM_SEM_GRUPO = 16; // de perto, cada pino aparece sozinho

const iconeGrupo = (n) =>
  L.divIcon({
    className: "",
    html: `<span style="display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--color-gold,#e9ad5a);color:#1a1408;font-weight:600;font-size:14px;line-height:1;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)">${n}</span>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });

/** Junta os pinos que ficariam um em cima do outro no zoom atual. */
export function agrupar(pontos, paraTela, zoom) {
  if (zoom >= ZOOM_SEM_GRUPO) return pontos.map((p) => [p]);
  const grupos = [];
  for (const p of pontos) {
    const px = paraTela(p);
    const g = grupos.find((x) => Math.hypot(x.px.x - px.x, x.px.y - px.y) < RAIO);
    if (g) g.itens.push(p);
    else grupos.push({ px, itens: [p] });
  }
  return grupos.map((g) => g.itens);
}

/**
 * Pinos agrupados com o número de empreendimentos. Tocar no grupo aproxima o mapa;
 * se estão todos no mesmo ponto (localização aproximada pelo bairro), abre a lista.
 */
export function MarcadoresAgrupados({ pontos, renderizar, listar }) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const aoMudar = () => setZoom(map.getZoom());
    map.on("zoomend", aoMudar);
    return () => map.off("zoomend", aoMudar);
  }, [map]);

  const grupos = useMemo(
    () => agrupar(pontos, (p) => map.project([p.latitude, p.longitude], zoom), zoom),
    [pontos, map, zoom],
  );

  return grupos.map((itens) => {
    if (itens.length === 1) return <Fragment key={itens[0].id}>{renderizar(itens[0])}</Fragment>;
    const lat = itens.reduce((s, p) => s + Number(p.latitude), 0) / itens.length;
    const lng = itens.reduce((s, p) => s + Number(p.longitude), 0) / itens.length;
    const mesmoPonto = itens.every((p) => p.latitude === itens[0].latitude && p.longitude === itens[0].longitude);
    return (
      <Marker
        key={itens.map((p) => p.id).join("-")}
        position={[lat, lng]}
        icon={iconeGrupo(itens.length)}
        title={`${itens.length} empreendimentos`}
        eventHandlers={mesmoPonto ? undefined : { click: () => map.fitBounds(itens.map((p) => [p.latitude, p.longitude]), { padding: [48, 48], maxZoom: ZOOM_SEM_GRUPO }) }}
      >
        {mesmoPonto && <Popup>{listar(itens)}</Popup>}
      </Marker>
    );
  });
}

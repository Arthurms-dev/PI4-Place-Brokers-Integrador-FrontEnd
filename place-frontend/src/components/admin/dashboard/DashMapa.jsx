import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Tooltip } from "react-leaflet";
import { FitBounds } from "@/components/map/FitBounds";
import { MapTiles } from "@/components/map/MapTiles";

export default function DashMapa({ pontos }) {
  return (
    <MapContainer center={[-8.05, -34.9]} zoom={9} scrollWheelZoom={false} className="size-full bg-card-2">
      <MapTiles />
      <FitBounds pontos={pontos} />
      {pontos.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.latitude, p.longitude]}
          radius={Math.min(28, 9 + Math.sqrt(p.views) * 2)}
          pathOptions={{ color: "#e9ad5a", weight: 2, fillColor: "#e9ad5a", fillOpacity: 0.35 }}
        >
          <Tooltip direction="top">
            <strong>{p.title}</strong>
            <br />
            {p.city}/{p.state} · {p.views} {p.views === 1 ? "visualização" : "visualizações"}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
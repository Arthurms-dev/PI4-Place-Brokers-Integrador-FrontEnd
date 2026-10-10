import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker } from "react-leaflet";
import { MapTiles } from "@/components/map/MapTiles";

const pino = L.divIcon({
  className: "",
  html: '<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5);background:#e9ad5a"></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

export default function MiniMapa({ lat, lng }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={false}
      dragging={!L.Browser.mobile}
      className="size-full bg-card-2"
    >
      <MapTiles />
      <Marker position={[lat, lng]} icon={pino} />
    </MapContainer>
  );
}
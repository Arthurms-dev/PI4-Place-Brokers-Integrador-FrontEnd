
import { useEffect } from "react";
import { TileLayer, useMap } from "react-leaflet";

export function MapTiles() {
  const map = useMap();

  useEffect(() => {
    map.attributionControl?.setPrefix(false);
  }, [map]);

  return (
    <TileLayer
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      maxZoom={19}
    />
  );
}

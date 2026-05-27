import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, MapPin, Check, Search } from "lucide-react";
import { Button } from "./ui/button";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

// Fix default icon asset paths broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface Locker {
  id: string;
  company: "easybox" | "fanbox" | "cargus";
  name: string;
  address: string;
  lat: number;
  lng: number;
}

const LOCKERS: Locker[] = [
  // EasyBox
  {
    id: "eb1",
    company: "easybox",
    name: "Carrefour Colosseum",
    address: "Str. Preciziei 3L, Sector 6, București",
    lat: 44.478,
    lng: 26.035,
  },
  {
    id: "eb2",
    company: "easybox",
    name: "Kaufland Militari",
    address: "Calea Plevnei 237, Sector 6, București",
    lat: 44.4353,
    lng: 26.0435,
  },
  {
    id: "eb3",
    company: "easybox",
    name: "Lidl Drumul Taberei",
    address: "Drumul Taberei 127, Sector 6, București",
    lat: 44.4267,
    lng: 26.0601,
  },
  {
    id: "eb4",
    company: "easybox",
    name: "Mega Image Unirii",
    address: "Bd. Unirii 3, Sector 3, București",
    lat: 44.4287,
    lng: 26.103,
  },
  {
    id: "eb5",
    company: "easybox",
    name: "Carrefour Băneasa",
    address: "Șos. București-Ploiești 42D, Sector 1, București",
    lat: 44.5149,
    lng: 26.0796,
  },
  // FANbox
  {
    id: "fn1",
    company: "fanbox",
    name: "FANbox Pantelimon",
    address: "Calea Pantelimon 219, Sector 2, București",
    lat: 44.43,
    lng: 26.1524,
  },
  {
    id: "fn2",
    company: "fanbox",
    name: "FANbox Militari",
    address: "Calea Militari 215, Sector 6, București",
    lat: 44.4353,
    lng: 26.0252,
  },
  {
    id: "fn3",
    company: "fanbox",
    name: "FANbox Berceni",
    address: "Șos. Berceni 75, Sector 4, București",
    lat: 44.3897,
    lng: 26.1101,
  },
  {
    id: "fn4",
    company: "fanbox",
    name: "FANbox Băneasa",
    address: "Str. Bistrița 5, Sector 1, București",
    lat: 44.5079,
    lng: 26.0752,
  },
  {
    id: "fn5",
    company: "fanbox",
    name: "FANbox Progresului",
    address: "Str. Progresului 2, Sector 5, București",
    lat: 44.4089,
    lng: 26.0601,
  },
  // Cargus
  {
    id: "cg1",
    company: "cargus",
    name: "Cargus Piața Victoriei",
    address: "Piața Victoriei 1, Sector 1, București",
    lat: 44.4651,
    lng: 26.0838,
  },
  {
    id: "cg2",
    company: "cargus",
    name: "Cargus Floreasca",
    address: "Calea Floreasca 167, Sector 1, București",
    lat: 44.4763,
    lng: 26.107,
  },
  {
    id: "cg3",
    company: "cargus",
    name: "Cargus Titan",
    address: "Bd. 1 Decembrie 1918 nr. 5, Sector 3, București",
    lat: 44.4154,
    lng: 26.149,
  },
  {
    id: "cg4",
    company: "cargus",
    name: "Cargus Văcărești",
    address: "Șos. Văcărești 391, Sector 4, București",
    lat: 44.4004,
    lng: 26.1192,
  },
  {
    id: "cg5",
    company: "cargus",
    name: "Cargus Cotroceni",
    address: "Bd. Iuliu Maniu 7, Sector 6, București",
    lat: 44.4389,
    lng: 26.0545,
  },
];

const COMPANY_LABELS: Record<Locker["company"], string> = {
  easybox: "Easybox",
  fanbox: "FANbox",
  cargus: "Cargus",
};

const COMPANY_PIN_BG: Record<Locker["company"], string> = {
  easybox: "#f97316",
  fanbox: "#2563eb",
  cargus: "#dc2626",
};

const COMPANY_FILTER_ACTIVE: Record<Locker["company"], string> = {
  easybox: "bg-orange-500 text-white border-orange-500",
  fanbox: "bg-blue-600 text-white border-blue-600",
  cargus: "bg-red-600 text-white border-red-600",
};

const BUCHAREST_CENTER: [number, number] = [44.4268, 26.1025];

function makeIcon(color: string, selected: boolean) {
  const size = selected ? 36 : 28;
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 1.4}" viewBox="0 0 28 39">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 25 14 25s14-15.667 14-25C28 6.268 21.732 0 14 0z"
        fill="${selected ? "#16a34a" : color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`);
  return L.divIcon({
    html: `<img src="data:image/svg+xml,${svg}" width="${size}" height="${Math.round(size * 1.4)}"/>`,
    className: "",
    iconSize: [size, Math.round(size * 1.4)],
    iconAnchor: [size / 2, Math.round(size * 1.4)],
    popupAnchor: [0, -Math.round(size * 1.4)],
  });
}

// ─── Bounds tracker + cluster layer ─────────────────────────────────────────

interface MapLayerProps {
  lockers: Locker[];
  selectedId: string | null;
  onMarkerClick: (locker: Locker) => void;
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}

function MapLayer({
  lockers,
  selectedId,
  onMarkerClick,
  onBoundsChange,
}: MapLayerProps) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds()),
  });

  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Emit initial bounds after mount
  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild cluster group whenever lockers or selectedId changes
  useEffect(() => {
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    const group = (L as any).markerClusterGroup({ maxClusterRadius: 50 }) as L.MarkerClusterGroup;
    markerMapRef.current.clear();

    lockers.forEach((locker) => {
      const icon = makeIcon(COMPANY_PIN_BG[locker.company], locker.id === selectedId);
      const marker = L.marker([locker.lat, locker.lng], { icon });
      marker.on("click", () => onMarkerClick(locker));
      marker.bindPopup(
        `<strong>${locker.name}</strong><br/><small>${locker.address}</small>`,
        { closeButton: false },
      );
      group.addLayer(marker);
      markerMapRef.current.set(locker.id, marker);
    });

    map.addLayer(group);
    clusterGroupRef.current = group;

    return () => {
      map.removeLayer(group);
    };
  }, [lockers, selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

// ─── Main modal ──────────────────────────────────────────────────────────────

interface LockerPickerModalProps {
  onClose: () => void;
  onSelect: (locker: Locker) => void;
  selectedLockerId?: string;
}

export function LockerPickerModal({
  onClose,
  onSelect,
  selectedLockerId,
}: LockerPickerModalProps) {
  const [activeCompanies, setActiveCompanies] = useState<Set<Locker["company"]>>(
    new Set(["easybox", "fanbox", "cargus"]),
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedLockerId ?? null,
  );
  const [search, setSearch] = useState("");
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  const visibleByCompany = LOCKERS.filter((l) => activeCompanies.has(l.company));

  const visibleOnMap = mapBounds
    ? visibleByCompany.filter((l) =>
        mapBounds.contains([l.lat, l.lng]),
      )
    : visibleByCompany;

  const listLockers = visibleOnMap.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q)
    );
  });

  const selectedLocker = selectedId
    ? LOCKERS.find((l) => l.id === selectedId) ?? null
    : null;

  const toggleCompany = (company: Locker["company"]) => {
    setActiveCompanies((prev) => {
      const next = new Set(prev);
      if (next.has(company)) {
        if (next.size === 1) return next;
        next.delete(company);
      } else {
        next.add(company);
      }
      return next;
    });
  };

  const handleMarkerClick = useCallback((locker: Locker) => {
    setSelectedId(locker.id);
    setTimeout(() => {
      listRef.current
        ?.querySelector(`[data-id="${locker.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }, []);

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    setMapBounds(bounds);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-4 border-b bg-white">
        <h2 className="text-lg font-bold">Alege Locker / Punct ridicare</h2>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Company filter tabs */}
      <div className="shrink-0 flex gap-2 px-4 py-3 border-b bg-white">
        {(["easybox", "fanbox", "cargus"] as Locker["company"][]).map((company) => (
          <button
            key={company}
            onClick={() => toggleCompany(company)}
            className={`flex-1 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${
              activeCompanies.has(company)
                ? COMPANY_FILTER_ACTIVE[company]
                : "border-gray-200 text-gray-400 bg-white"
            }`}
          >
            {COMPANY_LABELS[company]}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="shrink-0 h-56 w-full">
        <MapContainer
          center={BUCHAREST_CENTER}
          zoom={12}
          style={{ width: "100%", height: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapLayer
            lockers={visibleByCompany}
            selectedId={selectedId}
            onMarkerClick={handleMarkerClick}
            onBoundsChange={handleBoundsChange}
          />
        </MapContainer>
      </div>

      {/* Search */}
      <div className="shrink-0 px-4 py-2 border-b bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută locker după nume sau adresă..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border bg-gray-50 focus:outline-primary"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {listLockers.length}{" "}
          {listLockers.length === 1 ? "locker vizibil" : "lockere vizibile"} pe
          hartă
        </p>
      </div>

      {/* Locker list */}
      <div ref={listRef} className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {listLockers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <MapPin className="h-8 w-8 opacity-30" />
            <p className="text-sm">Niciun locker găsit în această zonă</p>
          </div>
        ) : (
          listLockers.map((locker) => {
            const isSelected = locker.id === selectedId;
            return (
              <button
                key={locker.id}
                data-id={locker.id}
                onClick={() => setSelectedId(locker.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected ? "bg-primary/5" : "hover:bg-gray-50"
                }`}
              >
                <span
                  className="mt-0.5 shrink-0 w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COMPANY_PIN_BG[locker.company] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p
                      className={`text-sm font-semibold truncate ${isSelected ? "text-primary" : "text-gray-800"}`}
                    >
                      {locker.name}
                    </p>
                    <span
                      className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: COMPANY_PIN_BG[locker.company] }}
                    >
                      {COMPANY_LABELS[locker.company]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {locker.address}
                  </p>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Confirm button */}
      <div className="shrink-0 px-4 py-4 border-t bg-white">
        <Button
          disabled={!selectedLocker}
          onClick={() => selectedLocker && onSelect(selectedLocker)}
          className="w-full h-12 rounded-full text-sm font-bold"
        >
          {selectedLocker
            ? `Selectează: ${selectedLocker.name}`
            : "Selectează un locker de pe hartă"}
        </Button>
      </div>
    </div>
  );
}

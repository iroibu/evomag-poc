import React, { useCallback, useEffect, useRef, useState } from "react";
import { X, MapPin, Check, Search, Package, ChevronRight, CheckCircle2, SlidersHorizontal } from "lucide-react";
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
  easybox: "#E30613",
  fanbox: "#00529B",
  cargus: "#F39200",
};

const COMPANY_TYPE_BG: Record<Locker["company"], string> = {
  easybox: "#FEF2F2",
  fanbox: "#F0F7FF",
  cargus: "#FFF7ED",
};

const COMPANY_FILTER_ACTIVE: Record<Locker["company"], string> = {
  easybox: "bg-[#E30613] text-white border-[#E30613] shadow-md",
  fanbox: "bg-[#00529B] text-white border-[#00529B] shadow-md",
  cargus: "bg-[#F39200] text-white border-[#F39200] shadow-md",
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
  const [activeCompany, setActiveCompany] = useState<Locker["company"] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedLockerId ?? null,
  );
  const [search, setSearch] = useState("");
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  const visibleByCompany = activeCompany
    ? LOCKERS.filter((l) => l.company === activeCompany)
    : LOCKERS;

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

  const selectCompany = (company: Locker["company"]) => {
    setActiveCompany((prev) => (prev === company ? null : company));
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      {/* Background Dim */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Sheet */}
      <div className="relative w-full max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl flex flex-col h-[90vh] sm:h-auto sm:max-h-[800px] overflow-hidden">

        {/* Drag handle — visible on mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#D1D1D6]" />
        </div>

        {/* Header */}
        <div className="shrink-0 px-5 pt-3 pb-4 border-b border-[#E5E5EA] sm:pt-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#111111] leading-tight">Alege Locker</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">Alege cel mai convenabil punct pentru tine</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 bg-[#F5F5F7] rounded-full text-[#6B7280] active:bg-gray-200 transition-colors touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Static Content (filters + map + search) */}
        <div className="shrink-0 bg-[#F5F5F7]">

          {/* Company filter tabs */}
          <div className="bg-white px-5 py-4">
            <div className="flex gap-2">
              {(["easybox", "fanbox", "cargus"] as Locker["company"][]).map((company) => (
                <button
                  key={company}
                  onClick={() => selectCompany(company)}
                  className={`flex-1 flex justify-center items-center py-2.5 px-2 rounded-full text-xs font-bold transition-all border touch-manipulation active:scale-95 ${
                    activeCompany === company
                      ? COMPANY_FILTER_ACTIVE[company]
                      : "bg-white text-[#111111] border-[#E5E5EA] active:bg-gray-50"
                  }`}
                >
                  {COMPANY_LABELS[company]}
                </button>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="px-5 pb-2">
            <div className="relative w-full h-[200px] sm:h-[220px] rounded-2xl border border-[#E5E5EA] overflow-hidden shadow-sm">
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
          </div>

          {/* Search Area */}
          <div className="px-5 pt-3 pb-2">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Caută locker după nume sau adresă..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E5EA] rounded-xl text-base font-medium focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow placeholder:text-[#6B7280]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Locker List — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-[#F5F5F7]">

          {/* List Section */}
          <div className="px-5 pt-2 pb-8">
            {listLockers.length === 0 ?(
              <div className="flex flex-col items-center justify-center py-12 text-[#6B7280] gap-2 bg-white rounded-[20px] border border-[#E5E5EA]">
                <MapPin className="h-8 w-8 opacity-30" />
                <p className="text-sm">Niciun locker găsit în această zonă</p>
              </div>
            ) : (
              <div className="space-y-4" ref={listRef}>
                {listLockers.map((locker) => {
                  const isSelected = locker.id === selectedId;
                  const color = COMPANY_PIN_BG[locker.company];
                  const bgColor = COMPANY_TYPE_BG[locker.company];

                  return isSelected ? (
                    <div
                      key={locker.id}
                      data-id={locker.id}
                      onClick={() => setSelectedId(locker.id)}
                      className="rounded-[20px] p-4 border shadow-md flex items-center gap-4 cursor-pointer relative overflow-hidden transition-all active:scale-[0.98] touch-manipulation"
                      style={{ backgroundColor: bgColor, borderColor: color }}
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-3xl opacity-10" style={{ backgroundImage: `linear-gradient(to bottom left, ${color}, transparent)` }} />
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <Package className="w-6 h-6" style={{ color }} />
                      </div>
                      <div className="flex-1 relative z-10 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-base leading-tight truncate" style={{ color }}>{locker.name}</h4>
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide bg-white shadow-sm border border-gray-100" style={{ color }}>
                            {COMPANY_LABELS[locker.company]}
                          </span>
                        </div>
                        <p className="text-xs mb-1 leading-relaxed opacity-80 truncate" style={{ color }}>{locker.address}</p>
                      </div>
                      <div className="shrink-0 relative z-10">
                        <CheckCircle2 className="w-6 h-6" style={{ color }} fill="#fff" />
                      </div>
                    </div>
                  ) : (
                    <div
                      key={locker.id}
                      data-id={locker.id}
                      onClick={() => setSelectedId(locker.id)}
                      className="bg-white rounded-[20px] p-4 border border-[#E5E5EA] shadow-sm flex items-center gap-4 cursor-pointer active:border-gray-300 active:bg-gray-50 transition-colors touch-manipulation"
                    >
                      <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-[#111111]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-[#111111] text-base leading-tight truncate">{locker.name}</h4>
                          <span
                            className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide bg-gray-50 border border-gray-100"
                            style={{ color: COMPANY_PIN_BG[locker.company] }}
                          >
                            {COMPANY_LABELS[locker.company]}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] mb-1 leading-relaxed truncate">{locker.address}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#E5E5EA] shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-white border-t border-[#E5E5EA] px-5 pt-4 pb-5 pb-safe">
          <button
            disabled={!selectedLocker}
            onClick={() => selectedLocker && onSelect(selectedLocker)}
            className="w-full h-14 text-white bg-[#E30613] rounded-[20px] font-bold text-base flex items-center justify-center shadow-[0_4px_14px_rgba(227,6,19,0.3)] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 touch-manipulation"
          >
            {selectedLocker
              ? `Selectează: ${selectedLocker.name}`
              : "Selectează un locker de pe hartă"}
          </button>
        </div>

      </div>
    </div>
  );
}

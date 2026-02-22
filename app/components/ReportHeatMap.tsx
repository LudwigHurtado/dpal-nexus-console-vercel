'use client';

import { useEffect, useRef, useState } from 'react';

export type MapReport = {
  id: string;
  title: string;
  severity: 'Low' | 'Moderate' | 'High';
  status: string;
  location: string;
  summary: string;
};

type SeverityFilter = 'All' | 'High' | 'Moderate' | 'Low';

type Props = {
  reports: MapReport[];
  entityRegion: string;
  entityName?: string;
  height?: number;
  onSelectReport?: (id: string) => void;
  selectedReportId?: string;
  compact?: boolean;
};

// ─── Coordinate lookup ───────────────────────────────────────────────────────

const LOCATION_COORDS: Record<string, [number, number]> = {
  // Bolivia – La Paz
  'Zona Sur - Calle 17': [-16.542, -68.082],
  'Sopocachi': [-16.505, -68.125],
  'Periférica': [-16.470, -68.103],
  // Bolivia – Cochabamba
  'Unit B - OR 3': [-17.392, -66.162],
  'Pharmacy Tower': [-17.383, -66.155],
  'Emergency Wing': [-17.403, -66.170],
  // Bolivia – Santa Cruz
  'Campus Norte': [-17.775, -63.175],
  'Campus Centro': [-17.790, -63.182],
  'Campus Este': [-17.800, -63.195],
  // New York
  'Brooklyn': [40.650, -73.950],
  'Queens': [40.730, -73.795],
  'Bronx': [40.837, -73.886],
  'Manhattan': [40.783, -73.971],
  // Los Angeles
  'Downtown LA': [34.052, -118.244],
  'Hollywood': [34.093, -118.328],
  'South LA': [33.990, -118.280],
  'Westside MS': [34.033, -118.452],
  'Central HS': [34.055, -118.244],
  'South ES': [33.972, -118.278],
  // Florida
  'Hialeah': [25.861, -80.278],
  'Coral Gables': [25.721, -80.269],
  'Kendall': [25.682, -80.356],
  // Logistics hubs
  'Memphis Hub': [35.149, -90.052],
  'Dallas Route 7': [32.782, -96.804],
  'Phoenix Hub': [33.449, -112.074],
  // Retail
  'Store #1142': [41.882, -87.632],
  'Store #982': [33.990, -118.280],
  'Store #450': [25.770, -80.195],
  // Generic zones
  'Central Zone': [39.500, -98.350],
  'North Sector': [40.014, -98.005],
  'South Sector': [39.010, -98.500],
};

const REGION_CENTERS: Record<string, [number, number]> = {
  'BO-LP': [-16.500, -68.150],
  'BO-CB': [-17.390, -66.160],
  'BO-SC': [-17.790, -63.180],
  'US-NY': [40.710, -74.010],
  'US-CA': [34.050, -118.240],
  'US-FL': [25.775, -80.195],
  'US-NATIONAL': [37.090, -95.713],
};

function resolveCoords(location: string, region: string): [number, number] {
  if (LOCATION_COORDS[location]) return LOCATION_COORDS[location];
  // Try partial match
  const key = Object.keys(LOCATION_COORDS).find(k => location.includes(k) || k.includes(location));
  if (key) return LOCATION_COORDS[key];
  // Deterministic jitter from location string so same location always maps same place
  const center = REGION_CENTERS[region] || [40.71, -74.01];
  let hash = 5381;
  for (let i = 0; i < location.length; i++) hash = (hash * 33 ^ location.charCodeAt(i)) & 0xffffff;
  const latOff = ((hash % 400) - 200) * 0.0012;
  const lngOff = ((hash % 340) - 170) * 0.0018;
  return [center[0] + latOff, center[1] + lngOff];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReportHeatMap({
  reports,
  entityRegion,
  entityName,
  height = 320,
  onSelectReport,
  selectedReportId,
  compact = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const onSelectRef = useRef(onSelectReport);
  const [filter, setFilter] = useState<SeverityFilter>('All');
  const [mapReady, setMapReady] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  onSelectRef.current = onSelectReport;

  // ── Inject Leaflet CSS once ─────────────────────────────────────────────
  useEffect(() => {
    if (document.querySelector('link[data-leaflet-css]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.setAttribute('data-leaflet-css', '1');
    document.head.appendChild(link);
  }, []);

  // ── Initialize map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let active = true;

    import('leaflet').then(({ default: L }) => {
      if (!active || !containerRef.current) return;

      const center = REGION_CENTERS[entityRegion] || [40.71, -74.01];
      const map = L.map(containerRef.current, {
        center,
        zoom: 11,
        scrollWheelZoom: false,
        zoomControl: true,
      });
      mapRef.current = map;
      leafletRef.current = L;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '© <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a> © <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      setMapReady(true);
    });

    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        leafletRef.current = null;
      }
    };
  }, []);

  // ── Draw/redraw markers when data or filter changes ─────────────────────
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map || !mapReady) return;

    // Clear previous markers/halos
    layersRef.current.forEach(l => { try { map.removeLayer(l); } catch (_) {} });
    layersRef.current = [];

    const SEV_COLORS: Record<string, string> = {
      High: '#ef4444',
      Moderate: '#f97316',
      Low: '#22c55e',
    };

    const filtered = reports.filter(r => {
      const sevOk = filter === 'All' || r.severity === filter;
      const statOk = statusFilter === 'All' || r.status === statusFilter;
      return sevOk && statOk;
    });

    const allCoords: [number, number][] = [];

    filtered.forEach(report => {
      const coords = resolveCoords(report.location, entityRegion);
      allCoords.push(coords);
      const color = SEV_COLORS[report.severity] || '#60a5fa';
      const isSel = report.id === selectedReportId;
      const isHigh = report.severity === 'High';

      // Outer glow halo
      const halo = L.circle(coords, {
        radius: isHigh ? 900 : 600,
        color: 'transparent',
        fillColor: color,
        fillOpacity: isHigh ? 0.14 : 0.09,
        interactive: false,
      }).addTo(map);
      layersRef.current.push(halo);

      // Inner halo for high severity (double ring)
      if (isHigh) {
        const inner = L.circle(coords, {
          radius: 420,
          color: 'transparent',
          fillColor: color,
          fillOpacity: 0.2,
          interactive: false,
        }).addTo(map);
        layersRef.current.push(inner);
      }

      // Circle marker
      const marker = L.circleMarker(coords, {
        radius: isSel ? 15 : isHigh ? 11 : 8,
        color: isSel ? '#ffffff' : color,
        weight: isSel ? 3 : 1.5,
        fillColor: color,
        fillOpacity: isSel ? 1.0 : 0.88,
      }).addTo(map);

      const popupHtml = `
        <div style="min-width:210px;font-family:system-ui,sans-serif;padding:2px 0">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px">
            <b style="font-size:13px;color:#0f172a">${report.id}</b>
            <span style="background:${color}22;color:${color};border:1px solid ${color}66;padding:1px 7px;border-radius:999px;font-size:10px;font-weight:700;white-space:nowrap">${report.severity}</span>
          </div>
          <p style="margin:5px 0 4px;font-size:12px;color:#334155;line-height:1.4">${report.title}</p>
          <div style="display:flex;gap:5px;margin-bottom:6px;flex-wrap:wrap">
            <span style="background:#f1f5f9;color:#475569;padding:2px 8px;border-radius:8px;font-size:10px">${report.status}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-bottom:4px">📍 ${report.location}</div>
          <div style="font-size:11px;color:#94a3b8;line-height:1.4">${(report.summary || '').slice(0, 110)}${(report.summary || '').length > 110 ? '…' : ''}</div>
          <div style="margin-top:8px;padding-top:6px;border-top:1px solid #e2e8f0">
            <span style="font-size:10px;color:#2563eb;font-weight:700;cursor:pointer" onclick="window.__nexusSelectReport?.('${report.id}')">→ Open in Reports Queue</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300, autoPan: true });

      marker.on('click', () => {
        onSelectRef.current?.(report.id);
        marker.openPopup();
      });

      layersRef.current.push(marker);
    });

    // Fit to all visible markers
    if (allCoords.length > 1) {
      try {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [36, 36], maxZoom: 14 });
      } catch (_) {}
    } else if (allCoords.length === 1) {
      map.setView(allCoords[0], 13);
    }
  }, [mapReady, reports, selectedReportId, entityRegion, filter, statusFilter]);

  // ── Expose global callback for popup button ─────────────────────────────
  useEffect(() => {
    (window as any).__nexusSelectReport = (id: string) => onSelectRef.current?.(id);
    return () => { delete (window as any).__nexusSelectReport; };
  }, []);

  const highCount = reports.filter(r => r.severity === 'High').length;
  const modCount = reports.filter(r => r.severity === 'Moderate').length;
  const lowCount = reports.filter(r => r.severity === 'Low').length;
  const statuses = ['All', ...Array.from(new Set(reports.map(r => r.status)))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Filter toolbar */}
      {!compact && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>Severity:</span>
          {([['All', '#64748b'], ['High', '#ef4444'], ['Moderate', '#f97316'], ['Low', '#22c55e']] as const).map(([f, c]) => {
            const count = f === 'All' ? reports.length : f === 'High' ? highCount : f === 'Moderate' ? modCount : lowCount;
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  cursor: 'pointer',
                  border: `1px solid ${isActive ? c : '#334155'}`,
                  background: isActive ? `${c}22` : 'rgba(15,23,42,0.7)',
                  color: isActive ? c : '#64748b',
                  fontWeight: isActive ? 700 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {f}
                <span style={{ fontSize: 10, opacity: 0.8 }}>({count})</span>
              </button>
            );
          })}

          <span style={{ marginLeft: 8, fontSize: 11, color: '#64748b', fontWeight: 700 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              background: '#0f172a',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: 8,
              padding: '3px 8px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            onClick={() => { setFilter('All'); setStatusFilter('All'); }}
            style={{ marginLeft: 'auto', padding: '3px 9px', borderRadius: 8, fontSize: 10, cursor: 'pointer', border: '1px solid #334155', background: 'rgba(15,23,42,0.6)', color: '#64748b' }}
          >
            Reset
          </button>
        </div>
      )}

      {/* Map container */}
      <div style={{ position: 'relative' }}>
        <div
          ref={containerRef}
          style={{ width: '100%', height, borderRadius: 10, overflow: 'hidden', background: '#0d1117' }}
        />
        {!mapReady && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#0d1117', borderRadius: 10, color: '#475569', fontSize: 13, flexDirection: 'column', gap: 8,
          }}>
            <div style={{ width: 24, height: 24, border: '2px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Loading map…
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: '#64748b', flexWrap: 'wrap', alignItems: 'center' }}>
        {[['#ef4444', 'High'], ['#f97316', 'Moderate'], ['#22c55e', 'Low']].map(([c, l]) => (
          <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block', boxShadow: `0 0 6px ${c}88` }} />
            {l}
          </span>
        ))}
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #fff', display: 'inline-block' }} />
          Selected
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10 }}>
          Scroll to zoom · Click markers to inspect
        </span>
      </div>
    </div>
  );
}

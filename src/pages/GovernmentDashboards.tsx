'use client';

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

type Level = 'city' | 'county' | 'state';
type Severity = 'low' | 'medium' | 'high' | 'critical';

type AlertItem = {
  id: string;
  title: string;
  area: string;
  category: string;
  severity: Severity;
  createdAt: string;
};

type KPI = {
  label: string;
  value: string;
  sub?: string;
};

const severityClass: Record<Severity, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const severityDot: Record<Severity, string> = {
  low: '#64748b',
  medium: '#d97706',
  high: '#ea580c',
  critical: '#dc2626',
};

function Card({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function KPIGrid({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {kpis.map((k) => (
        <div
          key={k.label}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="text-xs text-slate-500 font-medium">{k.label}</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{k.value}</div>
          {k.sub ? (
            <div className="mt-1 text-xs text-slate-500">{k.sub}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function LevelTabs({
  value,
  onChange,
}: {
  value: Level;
  onChange: (v: Level) => void;
}) {
  const tabs: { key: Level; label: string; icon: string }[] = [
    { key: 'city', label: 'City', icon: '🏙️' },
    { key: 'county', label: 'County', icon: '🗺️' },
    { key: 'state', label: 'State', icon: '🏛️' },
  ];

  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1 gap-1">
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={[
              'px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2',
              active
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-white hover:text-slate-900',
            ].join(' ')}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function MapHeatLayer({ label, level }: { label: string; level: Level }) {
  const dots =
    level === 'city'
      ? [
          { x: 30, y: 38, r: 48, c: 'rgba(239,68,68,0.35)' },
          { x: 62, y: 52, r: 36, c: 'rgba(249,115,22,0.3)' },
          { x: 48, y: 68, r: 28, c: 'rgba(234,179,8,0.3)' },
          { x: 73, y: 35, r: 22, c: 'rgba(249,115,22,0.25)' },
          { x: 20, y: 60, r: 18, c: 'rgba(234,179,8,0.25)' },
        ]
      : level === 'county'
      ? [
          { x: 25, y: 40, r: 52, c: 'rgba(239,68,68,0.3)' },
          { x: 55, y: 30, r: 44, c: 'rgba(249,115,22,0.28)' },
          { x: 70, y: 58, r: 38, c: 'rgba(239,68,68,0.25)' },
          { x: 40, y: 65, r: 30, c: 'rgba(234,179,8,0.25)' },
          { x: 80, y: 35, r: 22, c: 'rgba(234,179,8,0.2)' },
        ]
      : [
          { x: 30, y: 30, r: 60, c: 'rgba(239,68,68,0.25)' },
          { x: 60, y: 45, r: 50, c: 'rgba(249,115,22,0.22)' },
          { x: 75, y: 65, r: 42, c: 'rgba(239,68,68,0.2)' },
          { x: 45, y: 70, r: 36, c: 'rgba(234,179,8,0.22)' },
          { x: 20, y: 58, r: 28, c: 'rgba(234,179,8,0.18)' },
          { x: 85, y: 30, r: 24, c: 'rgba(239,68,68,0.2)' },
        ];

  return (
    <div className="relative h-[300px] rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden border border-slate-200">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
          <g key={v}>
            <line x1={`${v}%`} y1="0" x2={`${v}%`} y2="100%" stroke="#94a3b8" strokeWidth="1" />
            <line x1="0" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke="#94a3b8" strokeWidth="1" />
          </g>
        ))}
      </svg>

      {/* Heat blobs */}
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.r * 2,
            height: d.r * 2,
            transform: 'translate(-50%, -50%)',
            background: d.c,
            filter: 'blur(18px)',
          }}
        />
      ))}

      {/* Incident dots */}
      {dots.map((d, i) => (
        <div
          key={`dot-${i}`}
          className="absolute w-3 h-3 rounded-full border-2 border-white shadow"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            transform: 'translate(-50%, -50%)',
            background: i === 0 ? '#ef4444' : i <= 2 ? '#f97316' : '#eab308',
          }}
        />
      ))}

      {/* Labels */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-xs font-medium text-slate-600 bg-white/80 rounded-lg px-3 py-1.5 border border-slate-200">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />Low</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />Medium</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />High</span>
      </div>

      <div className="absolute top-3 right-3 bg-white/80 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200">
        {label}
      </div>
    </div>
  );
}

function AlertsList({ items }: { items: AlertItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((a) => (
        <div
          key={a.id}
          className="rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: severityDot[a.severity] }}
                />
                <div className="text-sm font-semibold text-slate-900 truncate">{a.title}</div>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {a.area} · {a.category} · {a.createdAt}
              </div>
            </div>
            <span
              className={[
                'flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                severityClass[a.severity],
              ].join(' ')}
            >
              {a.severity}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FiltersPanel({
  level,
  onReset,
}: {
  level: Level;
  onReset: () => void;
}) {
  const [severity, setSeverity] = useState<Severity | null>(null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-slate-900">Filters</div>
        <button
          onClick={() => { setSeverity(null); onReset(); }}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          Reset all
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Date Range</label>
          <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Custom…</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Category</label>
          <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none">
            <option>All categories</option>
            <option>Road Hazards</option>
            <option>Housing</option>
            <option>Public Safety</option>
            <option>Environmental</option>
            <option>Education</option>
            <option>Infrastructure</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            {level === 'city' ? 'Neighborhood / District' : level === 'county' ? 'City / Region' : 'County / District'}
          </label>
          <input
            placeholder="Type to filter…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Severity</label>
          <div className="grid grid-cols-2 gap-2">
            {(['low', 'medium', 'high', 'critical'] as Severity[]).map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(severity === s ? null : s)}
                className={[
                  'rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition-all',
                  severity === s
                    ? severityClass[s] + ' border-transparent'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Search</label>
          <input
            placeholder="Case ID, street, keyword…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        <button className="w-full rounded-xl bg-slate-900 text-white py-2.5 text-sm font-semibold hover:bg-slate-800 transition-colors">
          Apply Filters
        </button>
      </div>
    </div>
  );
}

function getDemoData(level: Level) {
  const kpisByLevel: Record<Level, KPI[]> = {
    city: [
      { label: 'Open Cases', value: '1,284', sub: 'All categories' },
      { label: 'Avg Response Time', value: '18h', sub: 'Last 7 days' },
      { label: 'High Severity', value: '97', sub: 'Needs action' },
      { label: 'Closed Today', value: '143', sub: 'Across departments' },
    ],
    county: [
      { label: 'Cities Reporting', value: '14', sub: 'Active feeds' },
      { label: 'Systemic Flags', value: '22', sub: 'Pattern detection' },
      { label: 'Sheriff/Jail Complaints', value: '61', sub: 'Last 30 days' },
      { label: 'Infrastructure Tickets', value: '408', sub: 'Open' },
    ],
    state: [
      { label: 'Counties at Risk', value: '9', sub: 'Above threshold' },
      { label: 'Litigation Exposure Index', value: '72', sub: 'Composite score' },
      { label: 'Compliance Score', value: '84%', sub: 'Program compliance' },
      { label: 'Public Sentiment', value: '+6.2', sub: 'Net trend' },
    ],
  };

  const trend = [
    { name: 'Mon', reports: 120 },
    { name: 'Tue', reports: 98 },
    { name: 'Wed', reports: 154 },
    { name: 'Thu', reports: 201 },
    { name: 'Fri', reports: 176 },
    { name: 'Sat', reports: 132 },
    { name: 'Sun', reports: 88 },
  ];

  const byArea =
    level === 'city'
      ? [
          { name: 'Zone 1', count: 220 },
          { name: 'Zone 2', count: 180 },
          { name: 'Zone 3', count: 140 },
          { name: 'Zone 4', count: 90 },
          { name: 'Zone 5', count: 70 },
        ]
      : level === 'county'
      ? [
          { name: 'City A', count: 310 },
          { name: 'City B', count: 240 },
          { name: 'City C', count: 190 },
          { name: 'City D', count: 120 },
          { name: 'City E', count: 80 },
        ]
      : [
          { name: 'County 1', count: 420 },
          { name: 'County 2', count: 350 },
          { name: 'County 3', count: 260 },
          { name: 'County 4', count: 180 },
          { name: 'County 5', count: 110 },
        ];

  const alerts: AlertItem[] = [
    {
      id: 'a1',
      title:
        level === 'state'
          ? 'Anomaly spike detected'
          : 'Urgent escalation — immediate review',
      area:
        level === 'city' ? 'District 4' : level === 'county' ? 'City B' : 'County 2',
      category: 'Public Safety',
      severity: 'critical',
      createdAt: 'Today 09:12',
    },
    {
      id: 'a2',
      title: 'Repeated complaint pattern flagged',
      area:
        level === 'city' ? 'Zone 2' : level === 'county' ? 'City A' : 'County 3',
      category: 'Housing',
      severity: 'high',
      createdAt: 'Today 08:40',
    },
    {
      id: 'a3',
      title: 'Response delay threshold exceeded',
      area:
        level === 'city' ? 'Zone 1' : level === 'county' ? 'City D' : 'County 4',
      category: 'Infrastructure',
      severity: 'medium',
      createdAt: 'Yesterday 18:05',
    },
    {
      id: 'a4',
      title: 'New intake surge — 3× baseline',
      area:
        level === 'city' ? 'Zone 3' : level === 'county' ? 'City C' : 'County 1',
      category: 'Road Hazards',
      severity: 'low',
      createdAt: 'Yesterday 14:22',
    },
  ];

  return { kpis: kpisByLevel[level], trend, byArea, alerts };
}

const NAV_ITEMS = [
  { label: 'Overview', icon: '📊' },
  { label: 'Reports', icon: '📄' },
  { label: 'Departments', icon: '🏢' },
  { label: 'Risk & Compliance', icon: '⚠️' },
  { label: 'Public Updates', icon: '📢' },
  { label: 'Export', icon: '📤' },
  { label: 'Settings', icon: '⚙️' },
];

export default function GovernmentDashboards() {
  const [level, setLevel] = useState<Level>('city');
  const [activeNav, setActiveNav] = useState('Overview');
  const demo = useMemo(() => getDemoData(level), [level]);

  const title =
    level === 'city'
      ? 'DPAL City Command Center'
      : level === 'county'
      ? 'DPAL County Oversight'
      : 'DPAL State Executive Portal';

  const mapLabel =
    level === 'city'
      ? 'City Heatmap • Neighborhood Clusters'
      : level === 'county'
      ? 'Regional Heatmap • Multi-city Clusters'
      : 'Statewide Heatmap • County Risk Layers';

  const barLabel =
    level === 'city'
      ? 'Reports by Zone'
      : level === 'county'
      ? 'Reports by City'
      : 'Reports by County';

  const alertsTitle = level === 'county' ? 'Escalations Queue' : 'Active Alerts';

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-[1440px] px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-sm font-bold">D</div>
            <div>
              <div className="text-base font-bold text-slate-900">{title}</div>
              <div className="text-xs text-slate-500">Unified transparency, response tracking &amp; risk intelligence</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <input
                placeholder="Search cases, districts…"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none w-56"
              />
            </div>
            <LevelTabs value={level} onChange={(v) => { setLevel(v); setActiveNav('Overview'); }} />
            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap">
              + Create Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="mx-auto max-w-[1440px] px-6 py-5 grid grid-cols-1 xl:grid-cols-[220px_1fr_300px] gap-5">
        {/* Sidebar */}
        <aside className="hidden xl:block">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 sticky top-20">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest px-2 py-2">Navigation</div>
            <nav className="space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(item.label)}
                  className={[
                    'w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium transition-all flex items-center gap-2.5',
                    activeNav === item.label
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-3">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Level</div>
              <div className="mt-1 text-sm font-bold text-slate-900 capitalize">{level} Government</div>
              <div className="mt-2 text-xs text-slate-500">Last synced: just now</div>
            </div>
          </div>
        </aside>

        {/* Center Content */}
        <main className="space-y-5 min-w-0">
          {/* KPI Row */}
          <KPIGrid kpis={demo.kpis} />

          {/* Heat Map */}
          <Card
            title={mapLabel}
            right={
              <div className="flex items-center gap-2">
                <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Layers
                </button>
                <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Export
                </button>
                <button className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Full Screen
                </button>
              </div>
            }
          >
            <MapHeatLayer label={mapLabel} level={level} />
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card
              title="Reports Trend (Last 7 Days)"
              right={
                <select className="text-xs rounded-lg border border-slate-200 px-2 py-1 text-slate-600">
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              }
            >
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={demo.trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                      cursor={{ stroke: '#e2e8f0' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="reports"
                      stroke="#0f172a"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 5, fill: '#0f172a' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card
              title={barLabel}
              right={
                <select className="text-xs rounded-lg border border-slate-200 px-2 py-1 text-slate-600">
                  <option>By count</option>
                  <option>By severity</option>
                </select>
              }
            >
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demo.byArea} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="count" fill="#0f172a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </main>

        {/* Right Rail */}
        <aside className="space-y-5">
          <FiltersPanel level={level} onReset={() => {}} />

          <Card title={alertsTitle}>
            <AlertsList items={demo.alerts} />
          </Card>

          <Card title="Auto-Insights">
            <ul className="space-y-3">
              <li className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <div className="text-sm font-semibold text-slate-900">Pattern detected</div>
                <div className="text-xs text-slate-500 mt-1">
                  Repeated complaints clustered above baseline in {level === 'city' ? 'Zone 2' : level === 'county' ? 'City B' : 'County 2'}. Recommend audit workflow.
                </div>
              </li>
              <li className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <div className="text-sm font-semibold text-slate-900">Response lag</div>
                <div className="text-xs text-slate-500 mt-1">
                  Delay threshold exceeded in one region. Recommend resource reallocation.
                </div>
              </li>
              <li className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                <div className="text-sm font-semibold text-blue-900">AI Recommendation</div>
                <div className="text-xs text-blue-700 mt-1">
                  Escalate top 3 {level === 'city' ? 'district' : level === 'county' ? 'city' : 'county'} alerts to leadership. Draft response template ready.
                </div>
              </li>
            </ul>
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-2">
              {[
                { label: '+ Submit new case', primary: true },
                { label: 'Export PDF report', primary: false },
                { label: 'Schedule briefing', primary: false },
                { label: 'Notify stakeholders', primary: false },
              ].map((a) => (
                <button
                  key={a.label}
                  className={[
                    'w-full rounded-xl border px-4 py-2.5 text-sm font-semibold text-left transition-colors',
                    a.primary
                      ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

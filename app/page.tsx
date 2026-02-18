'use client';

import React, { useMemo, useState } from 'react';

type EntityType =
  | 'City'
  | 'Hospital Network'
  | 'School District'
  | 'University'
  | 'Transit Agency'
  | 'Housing Authority'
  | 'Utilities Provider';

type DashboardView = 'Executive' | 'Operations' | 'Risk & Liability' | 'Public Portal';
type Status = 'Active' | 'Pilot' | 'Planning';
type Severity = 'Low' | 'Moderate' | 'High';
type ReportStatus = 'New' | 'Investigating' | 'Action Taken' | 'Resolved';

type Report = {
  id: string;
  channel: 'App' | 'WhatsApp' | 'Web Portal' | 'Hotline' | 'Field Team';
  title: string;
  severity: Severity;
  status: ReportStatus;
  location: string;
  eta: string;
};

type Entity = {
  id: string;
  name: string;
  type: EntityType;
  region: string;
  status: Status;
  confidence: number;
  kpis: Array<{ label: string; value: string; delta: string }>;
  valueStats: Array<{ label: string; value: string }>;
  modules: string[];
  reports: Report[];
};

const DASHBOARD_VIEWS: DashboardView[] = ['Executive', 'Operations', 'Risk & Liability', 'Public Portal'];

const ENTITIES: Entity[] = [
  {
    id: 'lapaz-city',
    name: 'City of La Paz',
    type: 'City',
    region: 'BO-LP',
    status: 'Active',
    confidence: 92,
    kpis: [
      { label: 'Open Cases', value: '482', delta: '-4.3%' },
      { label: 'Resolved (7d)', value: '1,207', delta: '+12.8%' },
      { label: 'Avg Response', value: '2.3h', delta: '-0.4h' },
      { label: 'SLA', value: '91%', delta: '+2.1%' },
    ],
    valueStats: [
      { label: 'Budget Saved (est.)', value: '$128,000/mo' },
      { label: 'Escalations Prevented', value: '143' },
      { label: 'Citizen Satisfaction Lift', value: '+18%' },
    ],
    modules: ['District Heatmap', 'Critical Queue', 'Public Works Dispatch', 'Legal Readiness'],
    reports: [
      { id: 'RPT-1042', channel: 'WhatsApp', title: 'Streetlight outage and unsafe crossing', severity: 'Moderate', status: 'Investigating', location: 'Zona Sur - Calle 17', eta: '6h' },
      { id: 'RPT-1049', channel: 'App', title: 'Drainage overflow near school entrance', severity: 'High', status: 'New', location: 'Sopocachi', eta: '2h' },
      { id: 'RPT-1055', channel: 'Web Portal', title: 'Illegal dumping hotspot recurrence', severity: 'Moderate', status: 'Action Taken', location: 'Periférica', eta: 'Completed' },
    ],
  },
  {
    id: 'metro-hospital',
    name: 'Metropolitan Hospital Network',
    type: 'Hospital Network',
    region: 'BO-CB',
    status: 'Pilot',
    confidence: 88,
    kpis: [
      { label: 'Patient Safety Alerts', value: '64', delta: '+8.6%' },
      { label: 'Incident Reviews', value: '23', delta: '+3.4%' },
      { label: 'Compliance Tasks', value: '118', delta: '-5.1%' },
      { label: 'SLA', value: '88%', delta: '+1.3%' },
    ],
    valueStats: [
      { label: 'Avoided Adverse Events', value: '21 this quarter' },
      { label: 'Audit Prep Time Saved', value: '46h/month' },
      { label: 'Legal Risk Reduction', value: '-27%' },
    ],
    modules: ['Clinical Risk Matrix', 'Adverse Event Workflow', 'Quality Board', 'Audit Exports'],
    reports: [
      { id: 'MED-4002', channel: 'Field Team', title: 'Sterilization compliance deviation', severity: 'High', status: 'Investigating', location: 'Unit B - OR 3', eta: '1h' },
      { id: 'MED-4011', channel: 'Web Portal', title: 'Medication near-miss report', severity: 'Moderate', status: 'Action Taken', location: 'Pharmacy Tower', eta: 'Completed' },
      { id: 'MED-4014', channel: 'Hotline', title: 'ER triage delay complaint', severity: 'Moderate', status: 'New', location: 'Emergency Wing', eta: '3h' },
    ],
  },
  {
    id: 'santa-cruz-schools',
    name: 'Santa Cruz Unified School District',
    type: 'School District',
    region: 'BO-SC',
    status: 'Active',
    confidence: 94,
    kpis: [
      { label: 'Campus Cases', value: '219', delta: '-2.2%' },
      { label: 'Interventions', value: '97', delta: '+9.4%' },
      { label: 'Parent Updates', value: '402', delta: '+15.2%' },
      { label: 'SLA', value: '93%', delta: '+1.8%' },
    ],
    valueStats: [
      { label: 'Incidents Resolved <24h', value: '82%' },
      { label: 'Repeat Cases Reduced', value: '-31%' },
      { label: 'Counselor Time Optimized', value: '+22%' },
    ],
    modules: ['Student Welfare Queue', 'Campus Risk Radar', 'Counselor Routing', 'Parent Transparency Feed'],
    reports: [
      { id: 'EDU-2291', channel: 'App', title: 'Bullying incident in recess area', severity: 'High', status: 'Investigating', location: 'Campus Norte', eta: '45m' },
      { id: 'EDU-2295', channel: 'WhatsApp', title: 'Unsafe gate crowding at pickup', severity: 'Moderate', status: 'New', location: 'Campus Centro', eta: '2h' },
      { id: 'EDU-2302', channel: 'Web Portal', title: 'Facilities hazard in science lab', severity: 'High', status: 'Action Taken', location: 'Campus Este', eta: 'Completed' },
    ],
  },
];

const uniqueByType: Record<EntityType, { headline: string; color: string; channelFocus: string[] }> = {
  City: {
    headline: 'Urban Command Channel',
    color: '#38bdf8',
    channelFocus: ['Citizen WhatsApp Intake', 'Field Inspector App', 'Public Portal Reports'],
  },
  'Hospital Network': {
    headline: 'Clinical Safety Channel',
    color: '#22c55e',
    channelFocus: ['Ward Supervisor Hotline', 'Compliance Web Form', 'Clinical Team Mobile'],
  },
  'School District': {
    headline: 'Campus Safety Channel',
    color: '#a78bfa',
    channelFocus: ['Parent App Reporting', 'Anonymous Web Intake', 'Counselor Escalation Queue'],
  },
  University: {
    headline: 'Academic Integrity Channel',
    color: '#14b8a6',
    channelFocus: ['Student Portal', 'Faculty Oversight Board', 'Campus Security Feed'],
  },
  'Transit Agency': {
    headline: 'Mobility Reliability Channel',
    color: '#f59e0b',
    channelFocus: ['Station Hotline', 'Driver Mobile Alerts', 'Commuter Web Reports'],
  },
  'Housing Authority': {
    headline: 'Tenant Protection Channel',
    color: '#ef4444',
    channelFocus: ['Tenant WhatsApp Intake', 'Inspector Field Workflow', 'Legal Case Pipeline'],
  },
  'Utilities Provider': {
    headline: 'Service Continuity Channel',
    color: '#84cc16',
    channelFocus: ['Outage Mobile Alerts', 'Regulator Portal', 'Crew Dispatch Terminal'],
  },
};

export default function EnhancedNexusPrototype() {
  const [selectedType, setSelectedType] = useState<EntityType | 'All'>('All');
  const [selectedEntityId, setSelectedEntityId] = useState(ENTITIES[0].id);
  const [view, setView] = useState<DashboardView>('Executive');
  const [reportsByEntity, setReportsByEntity] = useState<Record<string, Report[]>>(
    Object.fromEntries(ENTITIES.map((e) => [e.id, e.reports]))
  );

  const typeOptions = useMemo(() => ['All', ...Array.from(new Set(ENTITIES.map((e) => e.type)))] as const, []);
  const filteredEntities = useMemo(
    () => (selectedType === 'All' ? ENTITIES : ENTITIES.filter((e) => e.type === selectedType)),
    [selectedType]
  );

  const selectedEntity =
    filteredEntities.find((entity) => entity.id === selectedEntityId) || filteredEntities[0] || ENTITIES[0];

  const currentReports = reportsByEntity[selectedEntity.id] || [];

  const counts = useMemo(() => {
    const total = currentReports.length;
    const newCases = currentReports.filter((r) => r.status === 'New').length;
    const taken = currentReports.filter((r) => r.status === 'Action Taken').length;
    const resolved = currentReports.filter((r) => r.status === 'Resolved').length;
    return { total, newCases, taken, resolved };
  }, [currentReports]);

  const updateReportStatus = (reportId: string, next: ReportStatus) => {
    setReportsByEntity((prev) => ({
      ...prev,
      [selectedEntity.id]: (prev[selectedEntity.id] || []).map((report) =>
        report.id === reportId ? { ...report, status: next, eta: next === 'Resolved' ? 'Completed' : report.eta } : report
      ),
    }));
  };

  const typeProfile = uniqueByType[selectedEntity.type];

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.hero}>
          <div>
            <div style={styles.eyebrow}>DPAL NEXUS • HIGH-VALUE DEMO</div>
            <h1 style={styles.title}>Unique Dashboards by Channel + Entity</h1>
            <p style={styles.subtitle}>
              Better UI, real-feeling mock data, and working action buttons so you can demo real operational value now.
            </p>
          </div>
          <button style={styles.primaryBtn}>Generate Executive Brief</button>
        </header>

        <section style={styles.selectorPanel}>
          <div style={styles.panelLabel}>Entity Type</div>
          <div style={styles.chipWrap}>
            {typeOptions.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  const next = type === 'All' ? ENTITIES[0] : ENTITIES.find((e) => e.type === type);
                  if (next) setSelectedEntityId(next.id);
                }}
                style={{ ...styles.chip, ...(selectedType === type ? styles.chipActive : {}) }}
              >
                {type}
              </button>
            ))}
          </div>

          <div style={styles.row}>
            <select value={selectedEntity.id} onChange={(e) => setSelectedEntityId(e.target.value)} style={styles.select}>
              {filteredEntities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
            <div style={styles.chipWrap}>
              {DASHBOARD_VIEWS.map((item) => (
                <button key={item} onClick={() => setView(item)} style={{ ...styles.chip, ...(view === item ? styles.chipActive : {}) }}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section style={{ ...styles.typeBanner, borderColor: typeProfile.color }}>
          <div>
            <div style={{ ...styles.panelLabel, color: typeProfile.color }}>{typeProfile.headline}</div>
            <div style={styles.subtitle}>{selectedEntity.name} • {selectedEntity.region} • {selectedEntity.status}</div>
          </div>
          <div style={styles.channelWrap}>
            {typeProfile.channelFocus.map((c) => (
              <span key={c} style={{ ...styles.channelChip, borderColor: typeProfile.color }}>{c}</span>
            ))}
          </div>
        </section>

        <section style={styles.kpiGrid}>
          {selectedEntity.kpis.map((kpi) => (
            <div key={kpi.label} style={styles.kpiCard}>
              <div style={styles.kpiLabel}>{kpi.label}</div>
              <div style={styles.kpiValue}>{kpi.value}</div>
              <div style={styles.kpiDelta}>{kpi.delta}</div>
            </div>
          ))}
        </section>

        <section style={styles.twoCol}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Reports & Actions (Working Buttons)</h3>
            <div style={styles.valueRow}>
              <span>Total: {counts.total}</span>
              <span>New: {counts.newCases}</span>
              <span>Action Taken: {counts.taken}</span>
              <span>Resolved: {counts.resolved}</span>
            </div>

            <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
              {currentReports.map((r) => (
                <div key={r.id} style={styles.reportRow}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{r.id} • {r.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: 13 }}>
                      {r.channel} • {r.location} • Severity: {r.severity} • ETA: {r.eta}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12 }}>Status: <strong>{r.status}</strong></div>
                  </div>
                  <div style={styles.actionButtons}>
                    <button style={styles.smallBtn} onClick={() => updateReportStatus(r.id, 'Investigating')}>Investigate</button>
                    <button style={styles.smallBtn} onClick={() => updateReportStatus(r.id, 'Action Taken')}>Action Taken</button>
                    <button style={styles.smallBtnPrimary} onClick={() => updateReportStatus(r.id, 'Resolved')}>Resolve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Value Created by This Tech (Mock)</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {selectedEntity.valueStats.map((s) => (
                <div key={s.label} style={styles.valueStat}>
                  <span>{s.label}</span>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>

            <h4 style={{ marginTop: 16, marginBottom: 8 }}>Priority Modules</h4>
            <div style={styles.channelWrap}>
              {selectedEntity.modules.map((m) => (
                <span key={m} style={styles.channelChip}>{m}</span>
              ))}
            </div>

            <h4 style={{ marginTop: 16, marginBottom: 8 }}>Current View: {view}</h4>
            <p style={{ margin: 0, color: '#cbd5e1' }}>
              {view === 'Executive' && 'Leadership posture: performance trend, exposure signals, and strategic intervention priorities.'}
              {view === 'Operations' && 'Operational posture: queue pressure, assignment load, response latency, and throughput.'}
              {view === 'Risk & Liability' && 'Risk posture: legal exposure, unresolved critical incidents, and evidence completeness.'}
              {view === 'Public Portal' && 'Public posture: transparency feed, verified updates, trust metrics, and safe communications.'}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 10% 0%, #0f1f3d 0%, #060a13 50%, #04060c 100%)',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: 20,
  },
  shell: { maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 14 },
  hero: {
    border: '1px solid #334155',
    borderRadius: 16,
    padding: 18,
    background: 'linear-gradient(145deg, rgba(15,23,42,0.9), rgba(8,12,20,0.88))',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  eyebrow: { fontSize: 11, color: '#93c5fd', fontWeight: 700, letterSpacing: 1, marginBottom: 8 },
  title: { margin: 0, fontSize: 30, fontWeight: 900 },
  subtitle: { margin: 0, color: '#94a3b8' },
  primaryBtn: {
    border: '1px solid #2563eb',
    background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
    color: '#fff',
    borderRadius: 10,
    padding: '10px 12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  selectorPanel: {
    border: '1px solid #334155',
    borderRadius: 14,
    padding: 14,
    background: 'rgba(11,18,32,0.86)',
    display: 'grid',
    gap: 10,
  },
  panelLabel: { fontSize: 12, color: '#93c5fd', textTransform: 'uppercase', fontWeight: 800 },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: {
    border: '1px solid #334155',
    background: '#111827',
    color: '#cbd5e1',
    borderRadius: 10,
    padding: '7px 11px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  chipActive: { borderColor: '#2563eb', background: '#1d4ed8', color: '#fff' },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  select: {
    minWidth: 320,
    background: '#0f172a',
    color: '#e2e8f0',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '10px 12px',
  },
  typeBanner: {
    border: '1px solid',
    borderRadius: 14,
    padding: 14,
    background: 'rgba(11,18,32,0.8)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  channelWrap: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  channelChip: {
    border: '1px solid #334155',
    borderRadius: 999,
    padding: '5px 10px',
    color: '#cbd5e1',
    fontSize: 12,
  },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 10 },
  kpiCard: {
    border: '1px solid #334155',
    borderRadius: 12,
    padding: 12,
    background: 'rgba(15,23,42,0.82)',
  },
  kpiLabel: { color: '#94a3b8', fontSize: 12 },
  kpiValue: { fontSize: 28, fontWeight: 800, marginTop: 6 },
  kpiDelta: { color: '#86efac', fontSize: 12, marginTop: 6 },
  twoCol: { display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 12 },
  card: {
    border: '1px solid #334155',
    borderRadius: 14,
    padding: 14,
    background: 'rgba(11,18,32,0.86)',
  },
  cardTitle: { marginTop: 0, marginBottom: 10 },
  valueRow: { display: 'flex', gap: 12, flexWrap: 'wrap', color: '#cbd5e1', fontSize: 13 },
  reportRow: {
    border: '1px solid #334155',
    borderRadius: 12,
    padding: 10,
    background: '#0f172a',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionButtons: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  smallBtn: {
    border: '1px solid #475569',
    background: '#1e293b',
    color: '#e2e8f0',
    borderRadius: 8,
    padding: '6px 8px',
    fontSize: 12,
    cursor: 'pointer',
  },
  smallBtnPrimary: {
    border: '1px solid #16a34a',
    background: '#166534',
    color: '#fff',
    borderRadius: 8,
    padding: '6px 8px',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 700,
  },
  valueStat: {
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '9px 10px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    color: '#cbd5e1',
    background: '#0f172a',
  },
};

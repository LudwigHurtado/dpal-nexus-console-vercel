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
type ActionArea = 'reports' | 'dispatch' | 'analytics' | 'audit';

type Report = {
  id: string;
  channel: 'App' | 'WhatsApp' | 'Web Portal' | 'Hotline' | 'Field Team';
  title: string;
  severity: Severity;
  status: ReportStatus;
  location: string;
  eta: string;
  summary: string;
};

type Entity = {
  id: string;
  name: string;
  type: EntityType;
  region: string;
  status: Status;
  confidence: number;
  heroImage: string;
  kpis: Array<{ label: string; value: string; delta: string }>;
  valueStats: Array<{ label: string; value: string }>;
  modules: string[];
  reports: Report[];
};

const DASHBOARD_VIEWS: DashboardView[] = ['Executive', 'Operations', 'Risk & Liability', 'Public Portal'];
const ACTION_AREAS: Array<{ key: ActionArea; label: string }> = [
  { key: 'reports', label: 'Reports Queue' },
  { key: 'dispatch', label: 'Action Center' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'audit', label: 'Audit Trail' },
];

const ENTITIES: Entity[] = [
  {
    id: 'lapaz-city',
    name: 'City of La Paz',
    type: 'City',
    region: 'BO-LP',
    status: 'Active',
    confidence: 92,
    heroImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80',
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
      { id: 'RPT-1042', channel: 'WhatsApp', title: 'Streetlight outage and unsafe crossing', severity: 'Moderate', status: 'Investigating', location: 'Zona Sur - Calle 17', eta: '6h', summary: 'Multiple citizen reports indicate repeated outages at school crossing zone during peak hours.' },
      { id: 'RPT-1049', channel: 'App', title: 'Drainage overflow near school entrance', severity: 'High', status: 'New', location: 'Sopocachi', eta: '2h', summary: 'Flooding hazard affecting student access and vehicle safety. Requires rapid public works intervention.' },
      { id: 'RPT-1055', channel: 'Web Portal', title: 'Illegal dumping hotspot recurrence', severity: 'Moderate', status: 'Action Taken', location: 'Periférica', eta: 'Completed', summary: 'Pattern identified across 3 weeks. Cleanup completed, surveillance routing active.' },
    ],
  },
  {
    id: 'metro-hospital',
    name: 'Metropolitan Hospital Network',
    type: 'Hospital Network',
    region: 'BO-CB',
    status: 'Pilot',
    confidence: 88,
    heroImage: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1400&q=80',
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
      { id: 'MED-4002', channel: 'Field Team', title: 'Sterilization compliance deviation', severity: 'High', status: 'Investigating', location: 'Unit B - OR 3', eta: '1h', summary: 'Temperature record variance detected. Team isolated equipment and initiated protocol review.' },
      { id: 'MED-4011', channel: 'Web Portal', title: 'Medication near-miss report', severity: 'Moderate', status: 'Action Taken', location: 'Pharmacy Tower', eta: 'Completed', summary: 'Barcode mismatch prevented administration. Corrective action and retraining completed.' },
      { id: 'MED-4014', channel: 'Hotline', title: 'ER triage delay complaint', severity: 'Moderate', status: 'New', location: 'Emergency Wing', eta: '3h', summary: 'High patient volume period with queue overflow requiring staffing rebalance.' },
    ],
  },
  {
    id: 'santa-cruz-schools',
    name: 'Santa Cruz Unified School District',
    type: 'School District',
    region: 'BO-SC',
    status: 'Active',
    confidence: 94,
    heroImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1400&q=80',
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
      { id: 'EDU-2291', channel: 'App', title: 'Bullying incident in recess area', severity: 'High', status: 'Investigating', location: 'Campus Norte', eta: '45m', summary: 'Counselor and principal assigned. Family communication in progress.' },
      { id: 'EDU-2295', channel: 'WhatsApp', title: 'Unsafe gate crowding at pickup', severity: 'Moderate', status: 'New', location: 'Campus Centro', eta: '2h', summary: 'Traffic and supervision issue at peak dismissal hours; safety plan pending.' },
      { id: 'EDU-2302', channel: 'Web Portal', title: 'Facilities hazard in science lab', severity: 'High', status: 'Action Taken', location: 'Campus Este', eta: 'Completed', summary: 'Area contained, maintenance team resolved issue, documentation submitted.' },
    ],
  },
];

const uniqueByType: Record<EntityType, { headline: string; color: string; channelFocus: string[]; layout: 'city' | 'hospital' | 'school' | 'default' }> = {
  City: { headline: 'Urban Command Channel', color: '#38bdf8', channelFocus: ['Citizen WhatsApp Intake', 'Field Inspector App', 'Public Portal Reports'], layout: 'city' },
  'Hospital Network': { headline: 'Clinical Safety Channel', color: '#22c55e', channelFocus: ['Ward Supervisor Hotline', 'Compliance Web Form', 'Clinical Team Mobile'], layout: 'hospital' },
  'School District': { headline: 'Campus Safety Channel', color: '#a78bfa', channelFocus: ['Parent App Reporting', 'Anonymous Web Intake', 'Counselor Escalation Queue'], layout: 'school' },
  University: { headline: 'Academic Integrity Channel', color: '#14b8a6', channelFocus: ['Student Portal', 'Faculty Oversight Board', 'Campus Security Feed'], layout: 'default' },
  'Transit Agency': { headline: 'Mobility Reliability Channel', color: '#f59e0b', channelFocus: ['Station Hotline', 'Driver Mobile Alerts', 'Commuter Web Reports'], layout: 'default' },
  'Housing Authority': { headline: 'Tenant Protection Channel', color: '#ef4444', channelFocus: ['Tenant WhatsApp Intake', 'Inspector Field Workflow', 'Legal Case Pipeline'], layout: 'default' },
  'Utilities Provider': { headline: 'Service Continuity Channel', color: '#84cc16', channelFocus: ['Outage Mobile Alerts', 'Regulator Portal', 'Crew Dispatch Terminal'], layout: 'default' },
};

export default function EnhancedNexusPrototype() {
  const [selectedType, setSelectedType] = useState<EntityType | 'All'>('All');
  const [selectedEntityId, setSelectedEntityId] = useState(ENTITIES[0].id);
  const [view, setView] = useState<DashboardView>('Executive');
  const [activeArea, setActiveArea] = useState<ActionArea>('reports');
  const [reportsByEntity, setReportsByEntity] = useState<Record<string, Report[]>>(Object.fromEntries(ENTITIES.map((e) => [e.id, e.reports])));
  const [selectedReportId, setSelectedReportId] = useState<string>(ENTITIES[0].reports[0].id);

  const typeOptions = useMemo(() => ['All', ...Array.from(new Set(ENTITIES.map((e) => e.type)))] as const, []);
  const filteredEntities = useMemo(() => (selectedType === 'All' ? ENTITIES : ENTITIES.filter((e) => e.type === selectedType)), [selectedType]);
  const selectedEntity = filteredEntities.find((entity) => entity.id === selectedEntityId) || filteredEntities[0] || ENTITIES[0];
  const currentReports = reportsByEntity[selectedEntity.id] || [];
  const selectedReport = currentReports.find((r) => r.id === selectedReportId) || currentReports[0];

  const counts = useMemo(() => {
    const total = currentReports.length;
    const byStatus = {
      New: currentReports.filter((r) => r.status === 'New').length,
      Investigating: currentReports.filter((r) => r.status === 'Investigating').length,
      'Action Taken': currentReports.filter((r) => r.status === 'Action Taken').length,
      Resolved: currentReports.filter((r) => r.status === 'Resolved').length,
    };
    return { total, byStatus };
  }, [currentReports]);

  const updateReportStatus = (reportId: string, next: ReportStatus) => {
    setReportsByEntity((prev) => ({
      ...prev,
      [selectedEntity.id]: (prev[selectedEntity.id] || []).map((report) =>
        report.id === reportId ? { ...report, status: next, eta: next === 'Resolved' ? 'Completed' : report.eta } : report
      ),
    }));
    setActiveArea('audit');
  };

  const openArea = (area: ActionArea) => setActiveArea(area);
  const profile = uniqueByType[selectedEntity.type];

  const renderEntityLayout = () => {
    if (profile.layout === 'city') {
      return (
        <div style={styles.uniqueLayoutCard}>
          <h3 style={styles.cardTitle}>City Layout: Urban Ops Canvas</h3>
          <div style={styles.uniqueGrid3}>
            <MiniTile title="District Hotspots" value="17" subtitle="3 rising this week" />
            <MiniTile title="Road Hazards" value="29" subtitle="8 urgent" />
            <MiniTile title="Public Works ETA" value="2.1h" subtitle="median" />
          </div>
        </div>
      );
    }

    if (profile.layout === 'hospital') {
      return (
        <div style={styles.uniqueLayoutCard}>
          <h3 style={styles.cardTitle}>Hospital Layout: Clinical Safety Matrix</h3>
          <div style={styles.uniqueGrid2}>
            <MiniTile title="Critical Compliance Cases" value="9" subtitle="requires same-day closure" />
            <MiniTile title="Patient Safety Escalations" value="14" subtitle="4 linked to same workflow" />
          </div>
        </div>
      );
    }

    if (profile.layout === 'school') {
      return (
        <div style={styles.uniqueLayoutCard}>
          <h3 style={styles.cardTitle}>School Layout: Campus Welfare Board</h3>
          <div style={styles.uniqueGrid3}>
            <MiniTile title="Counselor Queue" value="23" subtitle="avg wait 5.4h" />
            <MiniTile title="Parent Outreach" value="96%" subtitle="within SLA" />
            <MiniTile title="High-Risk Campuses" value="3" subtitle="targeted intervention" />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.hero}>
          <div>
            <div style={styles.eyebrow}>DPAL NEXUS • HIGH-VALUE DEMO</div>
            <h1 style={styles.title}>Connected Dashboards with Clickable Flows</h1>
            <p style={styles.subtitle}>Buttons now navigate between sections, reports update status, and each entity type has a unique layout feel.</p>
          </div>
          <button style={styles.primaryBtn} onClick={() => openArea('analytics')}>Open Executive Brief</button>
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
                  if (next) {
                    setSelectedEntityId(next.id);
                    setSelectedReportId(next.reports[0]?.id || '');
                  }
                }}
                style={{ ...styles.chip, ...(selectedType === type ? styles.chipActive : {}) }}
              >
                {type}
              </button>
            ))}
          </div>

          <div style={styles.row}>
            <select
              value={selectedEntity.id}
              onChange={(e) => {
                setSelectedEntityId(e.target.value);
                const entity = ENTITIES.find((x) => x.id === e.target.value);
                if (entity?.reports[0]) setSelectedReportId(entity.reports[0].id);
              }}
              style={styles.select}
            >
              {filteredEntities.map((entity) => (
                <option key={entity.id} value={entity.id}>{entity.name}</option>
              ))}
            </select>
            <div style={styles.chipWrap}>
              {DASHBOARD_VIEWS.map((item) => (
                <button key={item} onClick={() => setView(item)} style={{ ...styles.chip, ...(view === item ? styles.chipActive : {}) }}>{item}</button>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.heroImageCard}>
          <img src={selectedEntity.heroImage} alt={selectedEntity.name} style={styles.heroImage} />
          <div style={styles.heroOverlay}>
            <div style={{ ...styles.panelLabel, color: profile.color }}>{profile.headline}</div>
            <h2 style={{ margin: '4px 0 0 0' }}>{selectedEntity.name}</h2>
            <p style={{ margin: '6px 0 0 0', color: '#cbd5e1' }}>{selectedEntity.region} • {selectedEntity.status} • Confidence {selectedEntity.confidence}%</p>
            <div style={styles.channelWrap}>
              {profile.channelFocus.map((c) => <span key={c} style={{ ...styles.channelChip, borderColor: profile.color }}>{c}</span>)}
            </div>
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

        {renderEntityLayout()}

        <section style={styles.navCard}>
          {ACTION_AREAS.map((a) => (
            <button key={a.key} onClick={() => openArea(a.key)} style={{ ...styles.sectionBtn, ...(activeArea === a.key ? styles.sectionBtnActive : {}) }}>
              {a.label}
            </button>
          ))}
        </section>

        <section style={styles.twoCol}>
          <div style={styles.card}>
            {activeArea === 'reports' && (
              <>
                <h3 style={styles.cardTitle}>Reports Queue</h3>
                <div style={styles.valueRow}>
                  <span>Total: {counts.total}</span>
                  <span>New: {counts.byStatus.New}</span>
                  <span>Investigating: {counts.byStatus.Investigating}</span>
                  <span>Action Taken: {counts.byStatus['Action Taken']}</span>
                  <span>Resolved: {counts.byStatus.Resolved}</span>
                </div>
                <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                  {currentReports.map((r) => (
                    <button key={r.id} onClick={() => setSelectedReportId(r.id)} style={{ ...styles.reportRow, ...(selectedReport?.id === r.id ? styles.reportSelected : {}) }}>
                      <div style={{ fontWeight: 700 }}>{r.id} • {r.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: 12 }}>{r.channel} • {r.location} • {r.severity} • ETA {r.eta}</div>
                      <div style={{ marginTop: 4, fontSize: 12 }}>Status: <strong>{r.status}</strong></div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeArea === 'dispatch' && (
              <>
                <h3 style={styles.cardTitle}>Action Center</h3>
                <p style={styles.subtitle}>Assign teams, trigger field actions, and track completion from one place.</p>
                <div style={styles.actionButtons}>
                  <button style={styles.smallBtn} onClick={() => setActiveArea('reports')}>Back to Queue</button>
                  <button style={styles.smallBtn} onClick={() => selectedReport && updateReportStatus(selectedReport.id, 'Investigating')}>Assign Team</button>
                  <button style={styles.smallBtn} onClick={() => selectedReport && updateReportStatus(selectedReport.id, 'Action Taken')}>Log Action Taken</button>
                  <button style={styles.smallBtnPrimary} onClick={() => selectedReport && updateReportStatus(selectedReport.id, 'Resolved')}>Mark Resolved</button>
                </div>
              </>
            )}

            {activeArea === 'analytics' && (
              <>
                <h3 style={styles.cardTitle}>Analytics Snapshot</h3>
                <div style={styles.uniqueGrid3}>
                  {selectedEntity.valueStats.map((s) => <MiniTile key={s.label} title={s.label} value={s.value} subtitle="value realized" />)}
                </div>
              </>
            )}

            {activeArea === 'audit' && (
              <>
                <h3 style={styles.cardTitle}>Audit Trail</h3>
                <ul style={styles.auditList}>
                  <li>09:01 - Report workflow updated from queue actions.</li>
                  <li>08:58 - Entity view switched to {selectedEntity.name}.</li>
                  <li>08:56 - Dashboard module toggled to {view} mode.</li>
                </ul>
              </>
            )}
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Selected Report Detail</h3>
            {selectedReport ? (
              <>
                <div style={styles.valueStat}><span>Report ID</span><strong>{selectedReport.id}</strong></div>
                <div style={styles.valueStat}><span>Status</span><strong>{selectedReport.status}</strong></div>
                <div style={styles.valueStat}><span>Channel</span><strong>{selectedReport.channel}</strong></div>
                <div style={styles.valueStat}><span>Severity</span><strong>{selectedReport.severity}</strong></div>
                <div style={styles.valueStat}><span>ETA</span><strong>{selectedReport.eta}</strong></div>
                <p style={{ color: '#cbd5e1', marginTop: 12 }}>{selectedReport.summary}</p>
                <div style={styles.actionButtons}>
                  <button style={styles.smallBtn} onClick={() => openArea('dispatch')}>Go to Action Center</button>
                  <button style={styles.smallBtn} onClick={() => openArea('audit')}>Open Audit Trail</button>
                  <button style={styles.smallBtnPrimary} onClick={() => selectedReport && updateReportStatus(selectedReport.id, 'Resolved')}>Resolve Now</button>
                </div>
              </>
            ) : (
              <p style={styles.subtitle}>Select a report from the queue.</p>
            )}

            <h4 style={{ marginTop: 16, marginBottom: 8 }}>Connected Modules</h4>
            <div style={styles.channelWrap}>{selectedEntity.modules.map((m) => <span key={m} style={styles.channelChip}>{m}</span>)}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

function MiniTile({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div style={styles.miniTile}>
      <div style={{ color: '#94a3b8', fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{subtitle}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'radial-gradient(circle at 10% 0%, #0f1f3d 0%, #060a13 50%, #04060c 100%)', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif', padding: 20 },
  shell: { maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 14 },
  hero: { border: '1px solid #334155', borderRadius: 16, padding: 18, background: 'linear-gradient(145deg, rgba(15,23,42,0.9), rgba(8,12,20,0.88))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  eyebrow: { fontSize: 11, color: '#93c5fd', fontWeight: 700, letterSpacing: 1, marginBottom: 8 },
  title: { margin: 0, fontSize: 30, fontWeight: 900 },
  subtitle: { margin: 0, color: '#94a3b8' },
  primaryBtn: { border: '1px solid #2563eb', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', borderRadius: 10, padding: '10px 12px', fontWeight: 700, cursor: 'pointer' },
  selectorPanel: { border: '1px solid #334155', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.86)', display: 'grid', gap: 10 },
  panelLabel: { fontSize: 12, color: '#93c5fd', textTransform: 'uppercase', fontWeight: 800 },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  chip: { border: '1px solid #334155', background: '#111827', color: '#cbd5e1', borderRadius: 10, padding: '7px 11px', fontWeight: 600, cursor: 'pointer' },
  chipActive: { borderColor: '#2563eb', background: '#1d4ed8', color: '#fff' },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  select: { minWidth: 320, background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 10, padding: '10px 12px' },
  heroImageCard: { position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid #334155', minHeight: 220 },
  heroImage: { width: '100%', height: 260, objectFit: 'cover', display: 'block' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(2,6,23,0.2), rgba(2,6,23,0.75))', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 },
  channelWrap: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  channelChip: { border: '1px solid #334155', borderRadius: 999, padding: '5px 10px', color: '#cbd5e1', fontSize: 12, background: 'rgba(15,23,42,0.7)' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 10 },
  kpiCard: { border: '1px solid #334155', borderRadius: 12, padding: 12, background: 'rgba(15,23,42,0.82)' },
  kpiLabel: { color: '#94a3b8', fontSize: 12 },
  kpiValue: { fontSize: 28, fontWeight: 800, marginTop: 6 },
  kpiDelta: { color: '#86efac', fontSize: 12, marginTop: 6 },
  uniqueLayoutCard: { border: '1px solid #334155', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.86)' },
  uniqueGrid3: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' },
  uniqueGrid2: { display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' },
  miniTile: { border: '1px solid #334155', borderRadius: 12, padding: 12, background: '#0f172a' },
  navCard: { border: '1px solid #334155', borderRadius: 12, padding: 10, background: 'rgba(11,18,32,0.86)', display: 'flex', gap: 8, flexWrap: 'wrap' },
  sectionBtn: { border: '1px solid #334155', background: '#0f172a', color: '#cbd5e1', borderRadius: 9, padding: '8px 10px', cursor: 'pointer', fontWeight: 700 },
  sectionBtnActive: { borderColor: '#2563eb', background: '#1d4ed8', color: '#fff' },
  twoCol: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12 },
  card: { border: '1px solid #334155', borderRadius: 14, padding: 14, background: 'rgba(11,18,32,0.86)' },
  cardTitle: { marginTop: 0, marginBottom: 10 },
  valueRow: { display: 'flex', gap: 12, flexWrap: 'wrap', color: '#cbd5e1', fontSize: 13 },
  reportRow: { border: '1px solid #334155', borderRadius: 12, padding: 10, background: '#0f172a', display: 'grid', gap: 3, textAlign: 'left', cursor: 'pointer', color: '#e2e8f0' },
  reportSelected: { borderColor: '#2563eb', boxShadow: '0 0 0 1px #2563eb inset' },
  actionButtons: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 },
  smallBtn: { border: '1px solid #475569', background: '#1e293b', color: '#e2e8f0', borderRadius: 8, padding: '6px 8px', fontSize: 12, cursor: 'pointer' },
  smallBtnPrimary: { border: '1px solid #16a34a', background: '#166534', color: '#fff', borderRadius: 8, padding: '6px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 700 },
  valueStat: { border: '1px solid #334155', borderRadius: 10, padding: '9px 10px', display: 'flex', justifyContent: 'space-between', gap: 10, color: '#cbd5e1', background: '#0f172a', marginBottom: 8 },
  auditList: { margin: 0, paddingLeft: 18, color: '#cbd5e1', lineHeight: 1.8 },
};

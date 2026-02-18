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

type Entity = {
  id: string;
  name: string;
  type: EntityType;
  region: string;
  status: Status;
  confidence: number;
  kpis: Array<{ label: string; value: string; delta?: string }>;
  modules: string[];
  risks: Array<{ title: string; severity: 'Low' | 'Moderate' | 'High' }>;
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
    modules: ['District Heatmap', 'Critical Queue', 'Department Throughput', 'Escalation Timeline'],
    risks: [
      { title: 'Recurring incidents in southern corridor', severity: 'Moderate' },
      { title: 'Delayed evidence closure for legal cases', severity: 'High' },
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
    modules: ['Facility Risk Matrix', 'Adverse Event Review', 'Clinical Compliance Board', 'Audit Trail'],
    risks: [
      { title: 'Unit-level backlog in compliance reviews', severity: 'Moderate' },
      { title: 'High-priority case pending legal validation', severity: 'High' },
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
    modules: ['Cross-Campus Tracker', 'Student Welfare Queue', 'Counselor Routing', 'Conduct Oversight'],
    risks: [
      { title: 'Bullying case concentration in 3 campuses', severity: 'Moderate' },
      { title: 'Escalated conduct case awaiting board action', severity: 'High' },
    ],
  },
  {
    id: 'andes-university',
    name: 'Andes State University',
    type: 'University',
    region: 'BO-LP',
    status: 'Planning',
    confidence: 81,
    kpis: [
      { label: 'Integrity Cases', value: '35', delta: '+6.3%' },
      { label: 'Security Alerts', value: '11', delta: '-9.7%' },
      { label: 'Policy Reviews', value: '52', delta: '+4.8%' },
      { label: 'SLA', value: '86%', delta: '+0.9%' },
    ],
    modules: ['Governance Cockpit', 'Policy Traceability', 'Department Scorecards', 'Evidence Timeline'],
    risks: [
      { title: 'Fragmented reporting standards by faculty', severity: 'Moderate' },
      { title: 'Incident ownership gaps in shared services', severity: 'Low' },
    ],
  },
  {
    id: 'metro-transit',
    name: 'Metro Transit Authority',
    type: 'Transit Agency',
    region: 'BO-LP',
    status: 'Active',
    confidence: 85,
    kpis: [
      { label: 'Route Disruptions', value: '79', delta: '-3.0%' },
      { label: 'Recovered', value: '68', delta: '+11.5%' },
      { label: 'Avg Recovery', value: '1.8h', delta: '-0.3h' },
      { label: 'SLA', value: '84%', delta: '+1.1%' },
    ],
    modules: ['Route Reliability Board', 'Dispatch Command', 'Hot Corridor Watch', 'Maintenance Escalation'],
    risks: [
      { title: 'Station safety incident recurrence trend', severity: 'Moderate' },
      { title: 'Critical route MTTR above threshold', severity: 'High' },
    ],
  },
  {
    id: 'housing-lp',
    name: 'La Paz Housing Authority',
    type: 'Housing Authority',
    region: 'BO-LP',
    status: 'Pilot',
    confidence: 79,
    kpis: [
      { label: 'Urgent Cases', value: '43', delta: '+5.1%' },
      { label: 'Legal Exposure', value: '12', delta: '+1.7%' },
      { label: 'Inspection Backlog', value: '67', delta: '-7.2%' },
      { label: 'SLA', value: '81%', delta: '+2.0%' },
    ],
    modules: ['Tenant Triage', 'Hazard Escalation', 'Property Compliance', 'Legal Packet Builder'],
    risks: [
      { title: 'Aging-property hazard accumulation', severity: 'High' },
      { title: 'Unverified urgent claims in backlog', severity: 'Moderate' },
    ],
  },
  {
    id: 'andean-utilities',
    name: 'Andean Utilities Group',
    type: 'Utilities Provider',
    region: 'BO-OR',
    status: 'Planning',
    confidence: 84,
    kpis: [
      { label: 'Active Outages', value: '21', delta: '-10.4%' },
      { label: 'Affected Users', value: '14,102', delta: '-6.0%' },
      { label: 'ETA Accuracy', value: '87%', delta: '+4.2%' },
      { label: 'SLA', value: '89%', delta: '+1.6%' },
    ],
    modules: ['Outage Map', 'Crew Readiness', 'Regulatory Export', 'Critical Node Monitor'],
    risks: [
      { title: 'Single-point substation dependency', severity: 'Moderate' },
      { title: 'Delayed closure in regulatory incidents', severity: 'Moderate' },
    ],
  },
];

const TREND_BARS = [78, 64, 89, 52, 93, 74, 68, 88, 70, 81, 76, 91];

export default function EnhancedNexusPrototype() {
  const [selectedType, setSelectedType] = useState<EntityType | 'All'>('All');
  const [selectedEntityId, setSelectedEntityId] = useState(ENTITIES[0].id);
  const [view, setView] = useState<DashboardView>('Executive');

  const typeOptions = useMemo(() => ['All', ...Array.from(new Set(ENTITIES.map((e) => e.type)))] as const, []);

  const filteredEntities = useMemo(() => {
    if (selectedType === 'All') return ENTITIES;
    return ENTITIES.filter((entity) => entity.type === selectedType);
  }, [selectedType]);

  const selectedEntity =
    filteredEntities.find((entity) => entity.id === selectedEntityId) || filteredEntities[0] || ENTITIES[0];

  const statusColor = (status: Status) => {
    if (status === 'Active') return '#22c55e';
    if (status === 'Pilot') return '#f59e0b';
    return '#60a5fa';
  };

  const severityColor = (severity: 'Low' | 'Moderate' | 'High') => {
    if (severity === 'High') return '#ef4444';
    if (severity === 'Moderate') return '#f59e0b';
    return '#22c55e';
  };

  const viewSummary = useMemo(() => {
    if (view === 'Executive') {
      return 'Strategic command view with performance posture, trends, and institutional priorities.';
    }
    if (view === 'Operations') {
      return 'Operational throughput view with live queues, response velocity, and assignment pressure.';
    }
    if (view === 'Risk & Liability') {
      return 'Risk intelligence view focused on legal exposure, unresolved critical cases, and SLA vulnerabilities.';
    }
    return 'Public transparency view with safe summaries, trust metrics, and non-sensitive status communications.';
  }, [view]);

  return (
    <main style={styles.page}>
      <div style={styles.glowA} />
      <div style={styles.glowB} />

      <div style={styles.shell}>
        <header style={styles.hero}>
          <div>
            <div style={styles.eyebrow}>DPAL NEXUS • NEXT-GEN PROTOTYPE</div>
            <h1 style={styles.title}>Institution Dashboard Experience</h1>
            <p style={styles.subtitle}>
              No left navigation. Fast selector flow. Premium visual system for cities, hospitals, schools, transit,
              housing, and utilities.
            </p>
          </div>
          <div style={styles.heroActions}>
            <button style={styles.secondaryBtn}>Share Preview</button>
            <button style={styles.primaryBtn}>Open Fullscreen Demo</button>
          </div>
        </header>

        <section style={styles.selectorPanel}>
          <div style={styles.panelBlock}>
            <div style={styles.panelLabel}>Entity Type</div>
            <div style={styles.chipWrap}>
              {typeOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    const next = type === 'All' ? ENTITIES[0] : ENTITIES.find((entity) => entity.type === type);
                    if (next) setSelectedEntityId(next.id);
                  }}
                  style={{ ...styles.chip, ...(selectedType === type ? styles.chipActive : {}) }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.selectorRow}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={styles.panelLabel}>Entity</div>
              <select
                value={selectedEntity?.id}
                onChange={(event) => setSelectedEntityId(event.target.value)}
                style={styles.select}
              >
                {filteredEntities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1.4, minWidth: 280 }}>
              <div style={styles.panelLabel}>Dashboard View</div>
              <div style={styles.chipWrap}>
                {DASHBOARD_VIEWS.map((item) => (
                  <button
                    key={item}
                    onClick={() => setView(item)}
                    style={{ ...styles.chip, ...(view === item ? styles.chipActive : {}) }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {selectedEntity && (
          <>
            <section style={styles.entityTopCard}>
              <div>
                <div style={styles.entityName}>{selectedEntity.name}</div>
                <div style={styles.entityMeta}>
                  {selectedEntity.type} • {selectedEntity.region} •{' '}
                  <span style={{ color: statusColor(selectedEntity.status), fontWeight: 700 }}>{selectedEntity.status}</span>
                </div>
              </div>

              <div style={styles.pillGroup}>
                <div style={styles.metricPill}>
                  <div style={styles.metricPillLabel}>Confidence</div>
                  <div style={styles.metricPillValue}>{selectedEntity.confidence}%</div>
                </div>
                <div style={styles.metricPill}>
                  <div style={styles.metricPillLabel}>Current View</div>
                  <div style={styles.metricPillValue}>{view}</div>
                </div>
              </div>
            </section>

            <section style={styles.kpiGrid}>
              {selectedEntity.kpis.map((kpi) => (
                <div key={kpi.label} style={styles.kpiCard}>
                  <div style={styles.kpiLabel}>{kpi.label}</div>
                  <div style={styles.kpiValue}>{kpi.value}</div>
                  {kpi.delta && <div style={styles.kpiDelta}>{kpi.delta} vs prior window</div>}
                </div>
              ))}
            </section>

            <section style={styles.twoCol}>
              <div style={styles.glassCard}>
                <div style={styles.cardTitle}>View Narrative</div>
                <p style={styles.cardBody}>{viewSummary}</p>

                <div style={styles.cardTitle}>Core Modules</div>
                <div style={styles.moduleWrap}>
                  {selectedEntity.modules.map((module) => (
                    <div key={module} style={styles.moduleChip}>
                      {module}
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.glassCard}>
                <div style={styles.cardTitle}>Risk Signals</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {selectedEntity.risks.map((risk) => (
                    <div key={risk.title} style={styles.riskRow}>
                      <div style={{ flex: 1 }}>{risk.title}</div>
                      <span style={{ ...styles.severityTag, borderColor: severityColor(risk.severity), color: severityColor(risk.severity) }}>
                        {risk.severity}
                      </span>
                    </div>
                  ))}
                </div>

                <button style={{ ...styles.primaryBtn, width: '100%', marginTop: 14 }}>Open Liability Drilldown</button>
              </div>
            </section>

            <section style={styles.analyticsCard}>
              <div style={styles.cardTitle}>12-Week Performance Pulse (Mock)</div>
              <div style={styles.barChart}>
                {TREND_BARS.map((value, idx) => (
                  <div key={`${value}-${idx}`} style={styles.barCol}>
                    <div style={{ ...styles.bar, height: `${value}%` }} />
                    <div style={styles.barLabel}>W{idx + 1}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.timelineCard}>
              <div style={styles.cardTitle}>Live Activity Stream (Mock)</div>
              <div style={styles.timelineItem}>
                <div style={styles.timelineDot} />
                <div>
                  <strong>Critical case escalated</strong> — routed to legal operations with evidence bundle attached.
                </div>
              </div>
              <div style={styles.timelineItem}>
                <div style={styles.timelineDot} />
                <div>
                  <strong>SLA threshold breached</strong> — assignment rebalanced to reduce queue pressure.
                </div>
              </div>
              <div style={styles.timelineItem}>
                <div style={styles.timelineDot} />
                <div>
                  <strong>Executive digest generated</strong> — summary package ready for leadership review.
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 0% 0%, #14213d 0%, #070b14 45%, #05070d 100%)',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  glowA: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.18)',
    filter: 'blur(120px)',
    top: -180,
    left: -140,
    pointerEvents: 'none',
  },
  glowB: {
    position: 'absolute',
    width: 460,
    height: 460,
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.14)',
    filter: 'blur(130px)',
    bottom: -180,
    right: -100,
    pointerEvents: 'none',
  },
  shell: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 1240,
    margin: '0 auto',
    padding: 24,
    display: 'grid',
    gap: 16,
  },
  hero: {
    border: '1px solid rgba(148, 163, 184, 0.24)',
    borderRadius: 18,
    padding: 20,
    background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(10,15,27,0.8))',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  eyebrow: {
    display: 'inline-block',
    fontSize: 11,
    letterSpacing: 1,
    color: '#93c5fd',
    border: '1px solid rgba(147,197,253,0.4)',
    borderRadius: 999,
    padding: '4px 10px',
    marginBottom: 10,
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: 30,
    fontWeight: 900,
  },
  subtitle: {
    margin: '8px 0 0 0',
    color: '#94a3b8',
    maxWidth: 820,
  },
  heroActions: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    border: '1px solid #2563eb',
    background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
    color: '#fff',
    borderRadius: 12,
    padding: '10px 14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryBtn: {
    border: '1px solid #334155',
    background: 'rgba(15, 23, 42, 0.7)',
    color: '#cbd5e1',
    borderRadius: 12,
    padding: '10px 14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  selectorPanel: {
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: 16,
    padding: 16,
    background: 'linear-gradient(160deg, rgba(11,18,32,0.88), rgba(7,12,22,0.82))',
    display: 'grid',
    gap: 14,
  },
  panelBlock: { display: 'grid', gap: 8 },
  panelLabel: {
    fontSize: 12,
    color: '#93c5fd',
    textTransform: 'uppercase',
    fontWeight: 800,
    letterSpacing: 0.7,
  },
  selectorRow: {
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap',
  },
  chipWrap: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    border: '1px solid #334155',
    background: '#111827',
    color: '#cbd5e1',
    borderRadius: 10,
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  chipActive: {
    background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
    borderColor: '#2563eb',
    color: '#fff',
    boxShadow: '0 10px 24px rgba(37,99,235,0.25)',
  },
  select: {
    width: '100%',
    background: '#0f172a',
    color: '#e2e8f0',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '10px 12px',
  },
  entityTopCard: {
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: 16,
    padding: 16,
    background: 'linear-gradient(135deg, rgba(11,18,32,0.85), rgba(9,14,24,0.8))',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  entityName: {
    margin: 0,
    fontSize: 26,
    fontWeight: 850,
  },
  entityMeta: {
    marginTop: 6,
    color: '#94a3b8',
  },
  pillGroup: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  metricPill: {
    border: '1px solid #334155',
    borderRadius: 12,
    padding: '8px 12px',
    minWidth: 120,
    background: 'rgba(15,23,42,0.7)',
  },
  metricPillLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricPillValue: {
    marginTop: 4,
    fontWeight: 800,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 12,
  },
  kpiCard: {
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: 14,
    padding: 14,
    background: 'linear-gradient(145deg, rgba(12,20,35,0.82), rgba(10,15,25,0.82))',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  kpiValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: 900,
    lineHeight: 1,
  },
  kpiDelta: {
    marginTop: 8,
    fontSize: 12,
    color: '#86efac',
  },
  twoCol: {
    display: 'grid',
    gap: 12,
    gridTemplateColumns: '1.2fr 1fr',
  },
  glassCard: {
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: 16,
    padding: 16,
    background: 'linear-gradient(145deg, rgba(12,20,35,0.82), rgba(10,15,25,0.78))',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 800,
    marginBottom: 10,
  },
  cardBody: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    marginTop: 0,
  },
  moduleWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  moduleChip: {
    border: '1px solid #334155',
    background: 'rgba(30,41,59,0.7)',
    borderRadius: 999,
    padding: '6px 10px',
    fontSize: 13,
    color: '#cbd5e1',
  },
  riskRow: {
    border: '1px solid #334155',
    borderRadius: 12,
    background: 'rgba(15,23,42,0.65)',
    padding: '10px 12px',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  severityTag: {
    border: '1px solid',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  analyticsCard: {
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: 16,
    padding: 16,
    background: 'linear-gradient(145deg, rgba(12,20,35,0.82), rgba(10,15,25,0.78))',
  },
  barChart: {
    marginTop: 12,
    height: 210,
    display: 'grid',
    gridTemplateColumns: 'repeat(12, minmax(24px, 1fr))',
    gap: 8,
    alignItems: 'end',
  },
  barCol: {
    height: '100%',
    display: 'grid',
    gridTemplateRows: '1fr auto',
    alignItems: 'end',
    gap: 6,
  },
  bar: {
    width: '100%',
    borderRadius: 8,
    background: 'linear-gradient(180deg,#38bdf8,#2563eb)',
    boxShadow: '0 8px 16px rgba(37,99,235,0.25)',
  },
  barLabel: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 11,
  },
  timelineCard: {
    border: '1px solid rgba(148, 163, 184, 0.18)',
    borderRadius: 16,
    padding: 16,
    background: 'linear-gradient(145deg, rgba(12,20,35,0.82), rgba(10,15,25,0.78))',
    display: 'grid',
    gap: 10,
  },
  timelineItem: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    color: '#cbd5e1',
    lineHeight: 1.6,
  },
  timelineDot: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    marginTop: 7,
    background: '#38bdf8',
    boxShadow: '0 0 0 4px rgba(56,189,248,0.2)',
  },
};

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

type Entity = {
  id: string;
  name: string;
  type: EntityType;
  region: string;
  status: 'Active' | 'Pilot' | 'Planning';
  kpis: Array<{ label: string; value: string }>;
  highlights: string[];
};

const DASHBOARDS: DashboardView[] = ['Executive', 'Operations', 'Risk & Liability', 'Public Portal'];

const ENTITIES: Entity[] = [
  {
    id: 'lapaz-city',
    name: 'City of La Paz',
    type: 'City',
    region: 'BO-LP',
    status: 'Active',
    kpis: [
      { label: 'Open Cases', value: '482' },
      { label: 'Resolved (7d)', value: '1,207' },
      { label: 'Avg Response', value: '2.3h' },
      { label: 'SLA', value: '91%' },
    ],
    highlights: [
      'District heatmap by severity and recurrence',
      'Department workload balancing panel',
      'Escalation queue for critical public safety issues',
    ],
  },
  {
    id: 'metropolitan-hospital',
    name: 'Metropolitan Hospital Network',
    type: 'Hospital Network',
    region: 'BO-CB',
    status: 'Pilot',
    kpis: [
      { label: 'Patient Safety Alerts', value: '64' },
      { label: 'Incident Reviews', value: '23' },
      { label: 'Compliance Tasks', value: '118' },
      { label: 'SLA', value: '88%' },
    ],
    highlights: [
      'Clinical risk dashboard by facility and unit',
      'Adverse event reporting and review workflow',
      'Audit-ready evidence timeline for legal/compliance teams',
    ],
  },
  {
    id: 'santa-cruz-schools',
    name: 'Santa Cruz Unified School District',
    type: 'School District',
    region: 'BO-SC',
    status: 'Active',
    kpis: [
      { label: 'Campus Cases', value: '219' },
      { label: 'Interventions', value: '97' },
      { label: 'Parent Updates', value: '402' },
      { label: 'SLA', value: '93%' },
    ],
    highlights: [
      'Cross-campus welfare and safety tracker',
      'Bullying and conduct incident workflow',
      'Principal action board with counselor routing',
    ],
  },
  {
    id: 'andes-university',
    name: 'Andes State University',
    type: 'University',
    region: 'BO-LP',
    status: 'Planning',
    kpis: [
      { label: 'Integrity Cases', value: '35' },
      { label: 'Security Alerts', value: '11' },
      { label: 'Policy Reviews', value: '52' },
      { label: 'SLA', value: '86%' },
    ],
    highlights: [
      'Academic integrity and governance cockpit',
      'Department-level accountability dashboard',
      'Evidence and policy traceability timeline',
    ],
  },
  {
    id: 'metro-transit',
    name: 'Metro Transit Authority',
    type: 'Transit Agency',
    region: 'BO-LP',
    status: 'Active',
    kpis: [
      { label: 'Route Disruptions', value: '79' },
      { label: 'Recovered', value: '68' },
      { label: 'Avg Recovery', value: '1.8h' },
      { label: 'SLA', value: '84%' },
    ],
    highlights: [
      'Route reliability board and dispatch queue',
      'Station incident trend analytics',
      'High-risk corridor watchlist',
    ],
  },
  {
    id: 'housing-lp',
    name: 'La Paz Housing Authority',
    type: 'Housing Authority',
    region: 'BO-LP',
    status: 'Pilot',
    kpis: [
      { label: 'Urgent Cases', value: '43' },
      { label: 'Legal Exposure', value: '12' },
      { label: 'Inspection Backlog', value: '67' },
      { label: 'SLA', value: '81%' },
    ],
    highlights: [
      'Tenant safety triage and legal risk map',
      'Structural hazard escalation workflow',
      'Compliance score by property cluster',
    ],
  },
  {
    id: 'andean-utilities',
    name: 'Andean Utilities Group',
    type: 'Utilities Provider',
    region: 'BO-OR',
    status: 'Planning',
    kpis: [
      { label: 'Active Outages', value: '21' },
      { label: 'Affected Users', value: '14,102' },
      { label: 'ETA Accuracy', value: '87%' },
      { label: 'SLA', value: '89%' },
    ],
    highlights: [
      'Outage impact and restoration command board',
      'Crew dispatch readiness and bottleneck map',
      'Regulatory incident export pipeline',
    ],
  },
];

export default function NoSidebarDashboard() {
  const [selectedType, setSelectedType] = useState<EntityType | 'All'>('All');
  const [selectedEntityId, setSelectedEntityId] = useState(ENTITIES[0].id);
  const [view, setView] = useState<DashboardView>('Executive');

  const typeOptions = useMemo(() => ['All', ...Array.from(new Set(ENTITIES.map((e) => e.type)))] as const, []);

  const entitiesForType = useMemo(() => {
    if (selectedType === 'All') return ENTITIES;
    return ENTITIES.filter((e) => e.type === selectedType);
  }, [selectedType]);

  const selectedEntity =
    entitiesForType.find((e) => e.id === selectedEntityId) || entitiesForType[0] || ENTITIES[0];

  const dashboardBlocks = useMemo(() => {
    if (!selectedEntity) return [];

    if (view === 'Executive') {
      return [
        'Executive snapshot with cross-area KPIs and strategic alerts.',
        `Top strategic priorities for ${selectedEntity.name}.`,
        'Entity benchmark position against similar institutions.',
      ];
    }

    if (view === 'Operations') {
      return [
        'Live operations board with routing, queues, and workload distribution.',
        'Priority queue with severity filters and assignment controls.',
        'Response timeline with throughput and bottleneck markers.',
      ];
    }

    if (view === 'Risk & Liability') {
      return [
        'Risk score cockpit with legal/compliance exposure indicators.',
        'Overdue and high-severity case monitor for rapid escalation.',
        'Audit trail status for evidentiary completeness and traceability.',
      ];
    }

    return [
      'Public-facing transparency dashboard template (mock only).',
      'Community trust metrics and verified updates feed.',
      'Privacy-safe incident summaries and status communications.',
    ];
  }, [selectedEntity, view]);

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.badge}>DPAL Nexus • Prototype</div>
            <h1 style={styles.title}>Dashboard Selector (No Left Menu)</h1>
            <p style={styles.subtitle}>
              Button-driven concept: pick an entity type, choose a city/hospital/institution, and preview dashboard variants.
            </p>
          </div>
        </header>

        <section style={styles.controlsCard}>
          <div style={styles.controlGroup}>
            <div style={styles.controlLabel}>1) Entity Type</div>
            <div style={styles.buttonWrap}>
              {typeOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    const next = type === 'All' ? ENTITIES[0] : ENTITIES.find((e) => e.type === type);
                    if (next) setSelectedEntityId(next.id);
                  }}
                  style={{
                    ...styles.chip,
                    ...(selectedType === type ? styles.chipActive : {}),
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.inlineControls}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={styles.controlLabel}>2) Entity</div>
              <select
                value={selectedEntity?.id}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                style={styles.select}
              >
                {entitiesForType.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={styles.controlLabel}>3) Dashboard Variant</div>
              <div style={styles.buttonWrap}>
                {DASHBOARDS.map((item) => (
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
            <section style={styles.entityHeader}>
              <div>
                <h2 style={{ margin: 0 }}>{selectedEntity.name}</h2>
                <div style={styles.entityMeta}>
                  {selectedEntity.type} • {selectedEntity.region} • {selectedEntity.status}
                </div>
              </div>
              <button style={styles.primaryButton}>Open Full {view} Dashboard</button>
            </section>

            <section style={styles.grid}>
              {selectedEntity.kpis.map((kpi) => (
                <div key={kpi.label} style={styles.kpiCard}>
                  <div style={styles.kpiLabel}>{kpi.label}</div>
                  <div style={styles.kpiValue}>{kpi.value}</div>
                </div>
              ))}
            </section>

            <section style={styles.previewCard}>
              <h3 style={{ marginTop: 0 }}>{view} Preview Blocks</h3>
              <ul style={styles.list}>
                {dashboardBlocks.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            <section style={styles.previewCard}>
              <h3 style={{ marginTop: 0 }}>Entity-Specific Modules</h3>
              <ul style={styles.list}>
                {selectedEntity.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    background: '#06080f',
    color: '#e2e8f0',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: 24,
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'grid',
    gap: 16,
  },
  header: {
    border: '1px solid #1f2937',
    borderRadius: 14,
    padding: 18,
    background: '#0b1220',
  },
  badge: {
    display: 'inline-block',
    border: '1px solid #334155',
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    color: '#93c5fd',
    marginBottom: 10,
  },
  title: { margin: 0 },
  subtitle: { marginBottom: 0, color: '#94a3b8' },
  controlsCard: {
    border: '1px solid #1f2937',
    borderRadius: 14,
    padding: 16,
    background: '#0b1220',
    display: 'grid',
    gap: 14,
  },
  controlGroup: { display: 'grid', gap: 8 },
  controlLabel: { fontSize: 12, color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase' },
  inlineControls: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
  buttonWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    background: '#0f172a',
    color: '#cbd5e1',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '8px 12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  chipActive: {
    background: '#0b5fff',
    borderColor: '#0b5fff',
    color: '#ffffff',
  },
  select: {
    width: '100%',
    background: '#0f172a',
    border: '1px solid #334155',
    color: '#e2e8f0',
    borderRadius: 10,
    padding: '10px 12px',
  },
  entityHeader: {
    border: '1px solid #1f2937',
    borderRadius: 14,
    padding: 16,
    background: '#0b1220',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  entityMeta: { color: '#94a3b8', marginTop: 6 },
  primaryButton: {
    background: '#16a34a',
    color: '#fff',
    border: '1px solid #16a34a',
    borderRadius: 10,
    padding: '10px 12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
  },
  kpiCard: {
    border: '1px solid #1f2937',
    borderRadius: 12,
    padding: 14,
    background: '#0b1220',
  },
  kpiLabel: { color: '#94a3b8', fontSize: 13 },
  kpiValue: { fontSize: 28, fontWeight: 800, marginTop: 4 },
  previewCard: {
    border: '1px solid #1f2937',
    borderRadius: 14,
    padding: 16,
    background: '#0b1220',
  },
  list: {
    margin: 0,
    paddingLeft: 18,
    color: '#cbd5e1',
    lineHeight: 1.8,
  },
};

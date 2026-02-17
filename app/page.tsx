'use client';

import React, { useMemo, useState } from 'react';

type EntityStatus = 'Active' | 'Trial' | 'Suspended';
type EntityType = 'City' | 'School District' | 'University' | 'Transit Agency' | 'Housing Authority' | 'Utilities Provider' | 'Custom';
type PlatformView = 'overview' | 'entities' | 'add-entity' | 'analytics' | 'audit' | 'billing';
type EntitySection = 'Dashboard' | 'Reports' | 'Routing' | 'SLA' | 'Roles' | 'Public Portal Settings';

type Entity = {
  id: string;
  icon: string;
  name: string;
  type: EntityType;
  status: EntityStatus;
  region: string;
  active: number;
  reportsToday: number;
  sla: number;
  alerts: number;
};

const INITIAL_ENTITIES: Entity[] = [
  { id: 'phoenix', icon: '🏛', name: 'City of Phoenix', type: 'City', status: 'Active', region: 'US-AZ', active: 124, reportsToday: 57, sla: 87, alerts: 3 },
  { id: 'lausd', icon: '🏫', name: 'LA Unified School District', type: 'School District', status: 'Active', region: 'US-CA', active: 38, reportsToday: 21, sla: 92, alerts: 1 },
  { id: 'state-u', icon: '🎓', name: 'State University', type: 'University', status: 'Trial', region: 'US-CA', active: 29, reportsToday: 14, sla: 90, alerts: 2 },
  { id: 'metro', icon: '🚇', name: 'Metro Transit Authority', type: 'Transit Agency', status: 'Active', region: 'US-NY', active: 84, reportsToday: 33, sla: 78, alerts: 5 },
  { id: 'housing', icon: '🏢', name: 'Housing Authority', type: 'Housing Authority', status: 'Active', region: 'US-IL', active: 51, reportsToday: 19, sla: 70, alerts: 8 },
  { id: 'util', icon: '⚡', name: 'Utilities Provider', type: 'Utilities Provider', status: 'Active', region: 'US-TX', active: 44, reportsToday: 17, sla: 81, alerts: 4 },
];

const entitySections: EntitySection[] = ['Dashboard', 'Reports', 'Routing', 'SLA', 'Roles', 'Public Portal Settings'];

function colorForStatus(status: EntityStatus | 'Healthy' | 'Warning' | 'Critical') {
  if (status === 'Active' || status === 'Healthy') return '#22c55e';
  if (status === 'Trial' || status === 'Warning') return '#f59e0b';
  return '#ef4444';
}

export default function NexusMasterDashboard() {
  const [entities, setEntities] = useState<Entity[]>(INITIAL_ENTITIES);
  const [platformView, setPlatformView] = useState<PlatformView>('overview');
  const [selectedEntityId, setSelectedEntityId] = useState<string>(INITIAL_ENTITIES[0].id);
  const [selectedEntitySection, setSelectedEntitySection] = useState<EntitySection>('Dashboard');
  const [query, setQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const [wizardStep, setWizardStep] = useState(1);
  const [draftName, setDraftName] = useState('');
  const [draftType, setDraftType] = useState<EntityType>('City');
  const [draftRegion, setDraftRegion] = useState('US');

  const filteredEntities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entities;
    return entities.filter((e) => e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q) || e.region.toLowerCase().includes(q));
  }, [entities, query]);

  const selectedEntity = entities.find((e) => e.id === selectedEntityId) || entities[0];

  const totals = useMemo(() => {
    const totalActive = entities.reduce((sum, e) => sum + e.active, 0);
    const reportsToday = entities.reduce((sum, e) => sum + e.reportsToday, 0);
    const avgSla = entities.reduce((sum, e) => sum + e.sla, 0) / Math.max(1, entities.length);
    const alerts = entities.reduce((sum, e) => sum + e.alerts, 0);
    return { totalActive, reportsToday, avgSla: avgSla.toFixed(1), alerts };
  }, [entities]);

  const createEntity = () => {
    if (!draftName.trim()) return;
    const id = draftName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) + '-' + Math.random().toString(36).slice(2, 6);
    const iconMap: Record<EntityType, string> = {
      City: '🏛',
      'School District': '🏫',
      University: '🎓',
      'Transit Agency': '🚇',
      'Housing Authority': '🏢',
      'Utilities Provider': '⚡',
      Custom: '🧩',
    };

    const next: Entity = {
      id,
      icon: iconMap[draftType],
      name: draftName,
      type: draftType,
      status: 'Trial',
      region: draftRegion,
      active: 0,
      reportsToday: 0,
      sla: 95,
      alerts: 0,
    };

    setEntities((prev) => [next, ...prev]);
    setSelectedEntityId(id);
    setSelectedEntitySection('Dashboard');
    setPlatformView('entities');
    setWizardStep(1);
    setDraftName('');
    setDraftType('City');
    setDraftRegion('US');
  };

  return (
    <main style={{ minHeight: '100vh', background: '#06080f', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0b5fff', display: 'grid', placeItems: 'center', fontWeight: 900 }}>N</div>
          <div style={{ fontWeight: 800, letterSpacing: 0.4 }}>DPAL Nexus</div>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Global search across reports, entities, and categories..."
          style={searchInput}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <button style={btn} onClick={() => setShowNotifications((v) => !v)}>Notifications</button>
          <button style={btn}>Platform Alerts ({totals.alerts})</button>
          <button style={{ ...btn, background: '#0b5fff', borderColor: '#0b5fff' }}>Platform Admin</button>
          {showNotifications && (
            <div style={{ position: 'absolute', right: 0, top: 46, width: 320, background: '#0b1220', border: '1px solid #334155', borderRadius: 12, padding: 10, zIndex: 40 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Latest Notifications</div>
              <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 6 }}>• Metro Transit SLA dropped below 80%</div>
              <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 6 }}>• New entity invitation accepted (LA Unified)</div>
              <div style={{ fontSize: 13, color: '#cbd5e1' }}>• 5 new reports flagged for verification</div>
            </div>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '330px 1fr', minHeight: 'calc(100vh - 72px)' }}>
        <aside style={{ borderRight: '1px solid #1f2937', padding: 16, overflowY: 'auto' }}>
          <SectionTitle>Platform</SectionTitle>
          <SidebarButton active={platformView === 'overview'} onClick={() => setPlatformView('overview')}>Overview</SidebarButton>
          <SidebarButton active={platformView === 'entities'} onClick={() => setPlatformView('entities')}>All Entities</SidebarButton>
          <SidebarButton active={platformView === 'add-entity'} onClick={() => setPlatformView('add-entity')}>Add Entity</SidebarButton>
          <SidebarButton active={platformView === 'analytics'} onClick={() => setPlatformView('analytics')}>Global Analytics</SidebarButton>
          <SidebarButton active={platformView === 'audit'} onClick={() => setPlatformView('audit')}>Audit Logs</SidebarButton>
          <SidebarButton active={platformView === 'billing'} onClick={() => setPlatformView('billing')}>Billing</SidebarButton>

          <SectionTitle>Entities</SectionTitle>
          {filteredEntities.map((e) => (
            <div key={e.id} style={{ marginBottom: 10 }}>
              <button
                onClick={() => {
                  setSelectedEntityId(e.id);
                  setPlatformView('entities');
                }}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  background: selectedEntityId === e.id ? '#10213f' : '#0b1220',
                  border: `1px solid ${selectedEntityId === e.id ? '#2c62ff' : '#263248'}`,
                  color: '#e2e8f0', borderRadius: 10, padding: '10px 12px', fontWeight: 700,
                }}
              >
                {e.icon} {e.name}
              </button>

              {selectedEntityId === e.id && (
                <div style={{ marginTop: 6, marginLeft: 8, display: 'grid', gap: 4 }}>
                  {entitySections.map((item) => (
                    <button
                      key={item}
                      onClick={() => setSelectedEntitySection(item)}
                      style={{
                        textAlign: 'left', borderRadius: 8, border: '1px solid #1f2937',
                        background: selectedEntitySection === item ? '#172338' : '#0b1220',
                        color: '#cbd5e1', fontSize: 12, padding: '6px 8px', cursor: 'pointer'
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        <section style={{ padding: 20 }}>
          {platformView === 'overview' && (
            <>
              <h1 style={{ marginTop: 0, marginBottom: 4 }}>Platform Overview</h1>
              <p style={{ marginTop: 0, color: '#94a3b8' }}>Unified control plane for all institutional tenant dashboards.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(150px,1fr))', gap: 12, marginTop: 16 }}>
                <Kpi label="Total Active Reports" value={String(totals.totalActive)} />
                <Kpi label="Reports Today" value={String(totals.reportsToday)} />
                <Kpi label="Avg. Response Time" value="2.9h" />
                <Kpi label="SLA Compliance" value={`${totals.avgSla}%`} />
                <Kpi label="Verification Rate" value="88.4%" />
              </div>

              <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
                <div style={card}>
                  <h3 style={{ marginTop: 0 }}>Entity Performance Grid</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: '#94a3b8', fontSize: 12 }}>
                        <th style={th}>Entity</th><th style={th}>Type</th><th style={th}>Active</th><th style={th}>SLA %</th><th style={th}>Alerts</th><th style={th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entities.map((e) => {
                        const health = e.sla >= 88 ? 'Healthy' : e.sla >= 75 ? 'Warning' : 'Critical';
                        return (
                          <tr key={e.id} style={{ borderTop: '1px solid #1f2937', cursor: 'pointer' }} onClick={() => { setSelectedEntityId(e.id); setPlatformView('entities'); }}>
                            <td style={td}>{e.name}</td>
                            <td style={td}>{e.type}</td>
                            <td style={td}>{e.active}</td>
                            <td style={td}>{e.sla}%</td>
                            <td style={td}>{e.alerts}</td>
                            <td style={td}><span style={{ color: colorForStatus(health), fontWeight: 700 }}>{health}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={card}>
                  <h3 style={{ marginTop: 0 }}>Global Trend Panel</h3>
                  <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', lineHeight: 1.8 }}>
                    <li>Top 5 rising categories (cross-entity)</li>
                    <li>Repeat offender locations</li>
                    <li>Most overdue entities</li>
                    <li>Most efficient entity leaderboard</li>
                    <li>SLA risk warnings</li>
                  </ul>
                </div>
              </div>

              <div style={{ ...card, marginTop: 14 }}>
                <h3 style={{ marginTop: 0 }}>Cross-Entity Incident Heatmap</h3>
                <p style={{ marginTop: 0, color: '#94a3b8' }}>Filters: Entity Type · Severity · Verification Status</p>
                <div style={{ height: 260, border: '1px dashed #334155', borderRadius: 14, background: 'linear-gradient(180deg,#0b1220,#090f1a)', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>
                  Heatmap canvas placeholder (regional/national visibility)
                </div>
              </div>
            </>
          )}

          {platformView === 'entities' && selectedEntity && (
            <>
              <h1 style={{ marginTop: 0, marginBottom: 4 }}>{selectedEntity.icon} {selectedEntity.name}</h1>
              <p style={{ marginTop: 0, color: '#94a3b8' }}>{selectedEntity.type} · {selectedEntity.region} · <span style={{ color: colorForStatus(selectedEntity.status), fontWeight: 700 }}>{selectedEntity.status}</span></p>

              {selectedEntitySection === 'Dashboard' && (
                <>
                  <div className="grid" style={{ marginTop: 12 }}>
                    <Card title="Active Reports" text={`${selectedEntity.active}`} />
                    <Card title="Reports Today" text={`${selectedEntity.reportsToday}`} />
                    <Card title="SLA Compliance" text={`${selectedEntity.sla}%`} />
                    <Card title="Open Alerts" text={`${selectedEntity.alerts}`} />
                  </div>
                  <EntityDashboardTemplate entity={selectedEntity} />
                  <EntityRiskLiabilityPanel entity={selectedEntity} />
                </>
              )}

              {selectedEntitySection === 'Reports' && <Panel title="Reports Queue" lines={[`High severity queue for ${selectedEntity.name}`, 'Evidence verification workflow enabled', 'Duplicate-detection checks active']} />}
              {selectedEntitySection === 'Routing' && <Panel title="Routing Rules" lines={['Road Hazard → Public Works', 'Safety Incident → Emergency Desk', 'Evidence dispute → Verification Team']} />}
              {selectedEntitySection === 'SLA' && <Panel title="SLA Targets" lines={['Critical: 30m acknowledge, 12h resolve', 'High: 2h acknowledge, 24h resolve', 'Standard: 8h acknowledge, 72h resolve']} />}
              {selectedEntitySection === 'Roles' && <Panel title="Role Matrix" lines={['Entity Admin: full tenant control', 'Moderator: review/verify/escalate', 'Analyst: read/export', 'Dispatcher: routing only']} />}
              {selectedEntitySection === 'Public Portal Settings' && <Panel title="Portal Controls" lines={['Verified-only public visibility', 'PII redaction on by default', 'Utility-only legal disclosure enabled']} />}
            </>
          )}

          {platformView === 'analytics' && <Panel title="Global Analytics" lines={['Cross-entity category trends', 'Regional hotspot growth', 'SLA risk forecast model', 'Verification quality score']} />}
          {platformView === 'audit' && <Panel title="Audit Logs" lines={['Policy update: Metro SLA threshold changed', 'Role assignment: new moderator invited', 'Routing rule update: Housing emergency escalation']} />}
          {platformView === 'billing' && <Panel title="Billing & Contracts" lines={['Active contracts: 6', 'Upcoming renewals: 2', 'Outstanding invoices: 1']} />}

          {platformView === 'add-entity' && (
            <div style={card}>
              <h2 style={{ marginTop: 0 }}>Add Entity Wizard (Step {wizardStep}/3)</h2>

              {wizardStep === 1 && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <label>Entity Name</label>
                  <input value={draftName} onChange={(e) => setDraftName(e.target.value)} style={input} placeholder="e.g., State Health Authority" />
                  <label>Entity Type</label>
                  <select value={draftType} onChange={(e) => setDraftType(e.target.value as EntityType)} style={input}>
                    <option>City</option><option>School District</option><option>University</option><option>Transit Agency</option><option>Housing Authority</option><option>Utilities Provider</option><option>Custom</option>
                  </select>
                </div>
              )}

              {wizardStep === 2 && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <label>Jurisdiction / Region</label>
                  <input value={draftRegion} onChange={(e) => setDraftRegion(e.target.value)} style={input} placeholder="US-CA" />
                  <label>Enable Modules</label>
                  <div style={{ color: '#cbd5e1', fontSize: 14 }}>☑ Map   ☑ Alerts   ☑ Evidence Vault   ☑ Public Portal</div>
                </div>
              )}

              {wizardStep === 3 && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <label>Invite Initial Admin</label>
                  <input style={input} placeholder="admin@entity.org" />
                  <label>Activation</label>
                  <div style={{ color: '#cbd5e1', fontSize: 14 }}>Entity will be created as <b>Trial</b> status.</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button style={btn} onClick={() => setWizardStep((s) => Math.max(1, s - 1))}>Back</button>
                {wizardStep < 3 ? (
                  <button style={{ ...btn, background: '#0b5fff', borderColor: '#0b5fff' }} onClick={() => setWizardStep((s) => Math.min(3, s + 1))}>Continue</button>
                ) : (
                  <button style={{ ...btn, background: '#16a34a', borderColor: '#16a34a' }} onClick={createEntity}>Create Entity</button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ marginTop: 16, marginBottom: 8, color: '#60a5fa', fontSize: 12, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>{children}</div>;
}

function SidebarButton({ children, active = false, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', cursor: 'pointer', padding: '9px 10px', borderRadius: 8,
      background: active ? '#10213f' : 'transparent', border: active ? '1px solid #2c62ff' : '1px solid transparent',
      marginBottom: 6, fontWeight: active ? 700 : 500, color: active ? '#dbeafe' : '#cbd5e1'
    }}>{children}</button>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return <div style={card}><div style={{ color: '#94a3b8', fontSize: 12 }}>{label}</div><div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{value}</div></div>;
}

function Card({ title, text }: { title: string; text: string }) {
  return <div style={card}><div style={{ color: '#94a3b8', fontSize: 13 }}>{title}</div><div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{text}</div></div>;
}

function Panel({ title, lines }: { title: string; lines: string[] }) {
  return <div style={{ ...card, marginTop: 12 }}><h3 style={{ marginTop: 0 }}>{title}</h3><ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', lineHeight: 1.8 }}>{lines.map((l) => <li key={l}>{l}</li>)}</ul></div>;
}

function EntityRiskLiabilityPanel({ entity }: { entity: Entity }) {
  const riskScore = Math.max(0, Math.min(100, Math.round((100 - entity.sla) * 0.9 + entity.alerts * 2 + entity.active * 0.08)));
  const liabilityLevel = riskScore >= 70 ? 'High' : riskScore >= 45 ? 'Moderate' : 'Low';
  const riskColor = liabilityLevel === 'High' ? '#ef4444' : liabilityLevel === 'Moderate' ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ ...card, marginTop: 12 }}>
      <h3 style={{ marginTop: 0 }}>Risk, Liability & Issues Cockpit</h3>
      <div className="grid" style={{ marginTop: 8 }}>
        <Card title="Risk Score" text={`${riskScore}/100`} />
        <Card title="Liability Exposure" text={liabilityLevel} />
        <Card title="Open Critical Alerts" text={`${entity.alerts}`} />
        <Card title="SLA Risk Gap" text={`${Math.max(0, 90 - entity.sla).toFixed(1)}%`} />
      </div>

      <div style={{ marginTop: 12, border: '1px solid #1f2937', borderRadius: 12, padding: 10, background: '#0a101b' }}>
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Current Liability Signal</div>
        <div style={{ fontWeight: 800, color: riskColor }}>{liabilityLevel} exposure driven by SLA pressure + unresolved alerts.</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <h4 style={{ margin: '0 0 8px 0' }}>Priority Issues</h4>
        <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', lineHeight: 1.8 }}>
          <li>Overdue high-severity reports requiring immediate assignment</li>
          <li>Recurring hotspot zones with repeated incidents</li>
          <li>Verification backlog increasing legal response risk</li>
        </ul>
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={{ ...btn, background: '#7f1d1d', borderColor: '#b91c1c' }}>Open Critical Queue</button>
        <button style={{ ...btn, background: '#78350f', borderColor: '#f59e0b' }}>Review Liability Cases</button>
        <button style={{ ...btn, background: '#0f172a', borderColor: '#334155' }}>Export Risk Report</button>
      </div>
    </div>
  );
}

function EntityDashboardTemplate({ entity }: { entity: Entity }) {
  if (entity.type === 'City') {
    return <Panel title="City Operations Dashboard" lines={[
      'District-level service request heatmap and escalation queue',
      'Public Works, Code Enforcement, and Safety department routing',
      'Road hazards, sanitation, and lighting response SLA tracking',
    ]} />;
  }
  if (entity.type === 'School District') {
    return <Panel title="School District Accountability Dashboard" lines={[
      'Campus safety incidents with counselor and security routing',
      'Bullying and facility hazard triage with protected evidence trails',
      'District-wide compliance timeline for board and legal review',
    ]} />;
  }
  if (entity.type === 'University') {
    return <Panel title="University Governance Dashboard" lines={[
      'Academic integrity and campus operations report pipeline',
      'Department-level resolution scoreboard (Facilities, Security, Student Affairs)',
      'Policy governance and auditable escalation decisions',
    ]} />;
  }
  if (entity.type === 'Transit Agency') {
    return <Panel title="Transit Reliability Dashboard" lines={[
      'Station and route incident board with dispatch severity filters',
      'Delay, outage, and maintenance SLA observability by line',
      'Recurring fault detection and high-risk corridor monitoring',
    ]} />;
  }
  if (entity.type === 'Housing Authority') {
    return <Panel title="Housing Authority Protection Dashboard" lines={[
      'Tenant safety and structural risk case prioritization',
      'Landlord compliance workflow with legal-grade evidence packets',
      'Urgent vulnerability queue for critical household conditions',
    ]} />;
  }
  if (entity.type === 'Utilities Provider') {
    return <Panel title="Utilities Service Assurance Dashboard" lines={[
      'Power/water/gas outage map with restoration SLA controls',
      'Crew dispatch and infrastructure incident escalation matrix',
      'Regulatory-ready audit exports with tamper-evident records',
    ]} />;
  }
  return <Panel title="Custom Entity Dashboard" lines={[
    'Configurable module layout with tenant-specific routing rules',
    'Role-based oversight and operational KPI instrumentation',
    'Evidence vault, SLA tracking, and policy controls enabled',
  ]} />;
}

const topBar: React.CSSProperties = {
  height: 72, borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 20px', position: 'sticky', top: 0, background: '#06080f', zIndex: 20,
};

const searchInput: React.CSSProperties = {
  width: 520, maxWidth: '45vw', background: '#0b1220', border: '1px solid #263248', color: '#cbd5e1', borderRadius: 12, padding: '10px 12px', outline: 'none',
};

const btn: React.CSSProperties = {
  background: '#0b1220', border: '1px solid #334155', color: '#e2e8f0', padding: '8px 10px', borderRadius: 10, fontWeight: 700, cursor: 'pointer'
};

const input: React.CSSProperties = {
  background: '#0b1220', border: '1px solid #334155', color: '#e2e8f0', borderRadius: 10, padding: '10px 12px', outline: 'none'
};

const card: React.CSSProperties = {
  border: '1px solid #1f2937', background: '#0b1220', borderRadius: 14, padding: 12,
};

const th: React.CSSProperties = { textAlign: 'left', padding: '8px 6px', fontWeight: 700 };
const td: React.CSSProperties = { textAlign: 'left', padding: '8px 6px', fontSize: 14 };

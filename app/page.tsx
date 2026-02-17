'use client';

import React, { useState } from 'react';

type Entity = {
  id: string;
  icon: string;
  name: string;
  type: string;
  active: number;
  sla: number;
  alerts: number;
  status: 'Healthy' | 'Warning' | 'Critical';
};

const entities: Entity[] = [
  { id: 'phoenix', icon: '🏛', name: 'City of Phoenix', type: 'City', active: 124, sla: 87, alerts: 3, status: 'Healthy' },
  { id: 'lausd', icon: '🏫', name: 'LA Unified School District', type: 'School', active: 38, sla: 92, alerts: 1, status: 'Healthy' },
  { id: 'university', icon: '🎓', name: 'State University', type: 'University', active: 29, sla: 90, alerts: 2, status: 'Healthy' },
  { id: 'metro', icon: '🚇', name: 'Metro Transit Authority', type: 'Transit', active: 84, sla: 78, alerts: 5, status: 'Warning' },
  { id: 'housing', icon: '🏢', name: 'Housing Authority', type: 'Authority', active: 51, sla: 70, alerts: 8, status: 'Critical' },
  { id: 'utilities', icon: '⚡', name: 'Utilities Provider', type: 'Utilities', active: 44, sla: 81, alerts: 4, status: 'Warning' },
];

const entityMenu = ['Dashboard', 'Reports', 'Routing', 'SLA', 'Roles', 'Public Portal Settings'];

function statusColor(status: Entity['status']) {
  if (status === 'Healthy') return '#22c55e';
  if (status === 'Warning') return '#f59e0b';
  return '#ef4444';
}

export default function NexusMasterDashboard() {
  const [selectedEntity, setSelectedEntity] = useState<string>('phoenix');

  return (
    <main style={{ minHeight: '100vh', background: '#06080f', color: '#e2e8f0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Bar */}
      <header style={{ height: 72, borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, background: '#06080f', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0b5fff', display: 'grid', placeItems: 'center', fontWeight: 900 }}>N</div>
          <div style={{ fontWeight: 800, letterSpacing: 0.4 }}>DPAL Nexus</div>
        </div>

        <input
          placeholder="Search reports across all tenants..."
          style={{ width: 460, maxWidth: '45vw', background: '#0b1220', border: '1px solid #263248', color: '#cbd5e1', borderRadius: 12, padding: '10px 12px', outline: 'none' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={btn}>Notifications</button>
          <button style={btn}>Platform Alerts</button>
          <button style={{ ...btn, background: '#0b5fff', borderColor: '#0b5fff' }}>Platform Admin</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: 'calc(100vh - 72px)' }}>
        {/* Sidebar */}
        <aside style={{ borderRight: '1px solid #1f2937', padding: 16, overflowY: 'auto' }}>
          <SectionTitle>Platform</SectionTitle>
          <SidebarItem active>Overview</SidebarItem>
          <SidebarItem>All Entities</SidebarItem>
          <SidebarItem>Add Entity</SidebarItem>
          <SidebarItem>Global Analytics</SidebarItem>
          <SidebarItem>Audit Logs</SidebarItem>
          <SidebarItem>Billing</SidebarItem>

          <SectionTitle>Entities</SectionTitle>
          {entities.map((e) => (
            <div key={e.id} style={{ marginBottom: 10 }}>
              <button
                onClick={() => setSelectedEntity(e.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: selectedEntity === e.id ? '#10213f' : '#0b1220',
                  border: `1px solid ${selectedEntity === e.id ? '#2c62ff' : '#263248'}`,
                  color: '#e2e8f0',
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {e.icon} {e.name}
              </button>
              <div style={{ marginTop: 6, marginLeft: 10, display: 'grid', gap: 4 }}>
                {entityMenu.map((item) => (
                  <div key={item} style={{ fontSize: 12, color: '#94a3b8' }}>• {item}</div>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Main Overview */}
        <section style={{ padding: 20 }}>
          <h1 style={{ marginTop: 0, marginBottom: 4 }}>Platform Overview</h1>
          <p style={{ marginTop: 0, color: '#94a3b8' }}>Unified control plane for all institutional dashboards.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(150px,1fr))', gap: 12, marginTop: 16 }}>
            <Kpi label="Total Active Reports" value="370" />
            <Kpi label="Reports Today" value="176" />
            <Kpi label="Avg. Response Time" value="2.9h" />
            <Kpi label="SLA Compliance" value="83.0%" />
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
                  {entities.map((e) => (
                    <tr key={e.id} style={{ borderTop: '1px solid #1f2937', cursor: 'pointer' }} onClick={() => setSelectedEntity(e.id)}>
                      <td style={td}>{e.name}</td>
                      <td style={td}>{e.type}</td>
                      <td style={td}>{e.active}</td>
                      <td style={td}>{e.sla}%</td>
                      <td style={td}>{e.alerts}</td>
                      <td style={td}><span style={{ color: statusColor(e.status), fontWeight: 700 }}>{e.status}</span></td>
                    </tr>
                  ))}
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
            <p style={{ marginTop: 0, color: '#94a3b8' }}>
              Filters: Entity Type · Severity · Verification Status
            </p>
            <div style={{ height: 260, border: '1px dashed #334155', borderRadius: 14, background: 'linear-gradient(180deg,#0b1220,#090f1a)', display: 'grid', placeItems: 'center', color: '#94a3b8' }}>
              Heatmap canvas placeholder (regional/national visibility)
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ marginTop: 16, marginBottom: 8, color: '#60a5fa', fontSize: 12, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>{children}</div>;
}

function SidebarItem({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <div style={{
      padding: '9px 10px',
      borderRadius: 8,
      background: active ? '#10213f' : 'transparent',
      border: active ? '1px solid #2c62ff' : '1px solid transparent',
      marginBottom: 6,
      fontWeight: active ? 700 : 500,
      color: active ? '#dbeafe' : '#cbd5e1'
    }}>
      {children}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div style={card}>
      <div style={{ color: '#94a3b8', fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}

const btn: React.CSSProperties = {
  background: '#0b1220',
  border: '1px solid #334155',
  color: '#e2e8f0',
  padding: '8px 10px',
  borderRadius: 10,
  fontWeight: 700,
};

const card: React.CSSProperties = {
  border: '1px solid #1f2937',
  background: '#0b1220',
  borderRadius: 14,
  padding: 12,
};

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 6px',
  fontWeight: 700,
};

const td: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 6px',
  fontSize: 14,
};

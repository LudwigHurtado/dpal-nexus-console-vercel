'use client';

import React, { useMemo, useState } from 'react';

type EntityType = 'City' | 'School District' | 'University' | 'Transit Agency' | 'Housing Authority' | 'Utilities Provider';
type EntityStatus = 'Active' | 'Trial' | 'Suspended';

type Entity = {
  id: string;
  name: string;
  type: EntityType;
  status: EntityStatus;
  region: string;
  createdAt: string;
  slaOnTime: number;
  reports24h: number;
};

const entities: Entity[] = [
  { id: 'phoenix', name: 'City of Phoenix', type: 'City', status: 'Active', region: 'US-AZ', createdAt: '2026-02-01', slaOnTime: 93.1, reports24h: 402 },
  { id: 'lausd', name: 'LA Unified', type: 'School District', status: 'Trial', region: 'US-CA', createdAt: '2026-02-10', slaOnTime: 89.2, reports24h: 231 },
  { id: 'metro-a', name: 'Metro Transit A', type: 'Transit Agency', status: 'Active', region: 'US-NY', createdAt: '2026-02-15', slaOnTime: 90.4, reports24h: 170 },
  { id: 'hydro-c', name: 'Utilities Provider C', type: 'Utilities Provider', status: 'Active', region: 'US-TX', createdAt: '2026-02-16', slaOnTime: 95.6, reports24h: 98 },
];

type TabKey =
  | 'overview'
  | 'entities'
  | 'wizard'
  | 'roles'
  | 'routing'
  | 'portal'
  | 'audit'
  | 'architecture';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Global Oversight' },
  { key: 'entities', label: 'Entity Manager' },
  { key: 'wizard', label: 'Entity Setup Wizard' },
  { key: 'roles', label: 'Roles & Access' },
  { key: 'routing', label: 'Routing + SLA' },
  { key: 'portal', label: 'Public Portal' },
  { key: 'audit', label: 'Audit + Billing' },
  { key: 'architecture', label: 'Tech Architecture' },
];

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card">
      <div style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      <div className="kpi">{value}</div>
    </div>
  );
}

export default function HomePage() {
  const [tab, setTab] = useState<TabKey>('overview');
  const [archView, setArchView] = useState<'control-plane' | 'data-plane' | 'security' | 'deployment' | 'integrations'>('control-plane');

  const totals = useMemo(() => {
    const reports = entities.reduce((sum, e) => sum + e.reports24h, 0);
    const avgSla = entities.reduce((sum, e) => sum + e.slaOnTime, 0) / entities.length;
    return { reports, avgSla: avgSla.toFixed(1), count: entities.length };
  }, []);

  return (
    <main className="page">
      <h1 style={{ marginTop: 0 }}>DPAL Nexus Console</h1>
      <p style={{ color: '#94a3b8', marginTop: -6 }}>
        Institutional demo environment for multi-tenant DPAL models.
      </p>

      <section className="card" style={{ paddingBottom: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              className="btn"
              onClick={() => setTab(t.key)}
              style={{
                background: tab === t.key ? '#0b5fff' : '#0f172a',
                borderColor: tab === t.key ? '#0b5fff' : '#334155',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {tab === 'overview' && (
        <>
          <section className="grid" style={{ marginTop: 16 }}>
            <Kpi label="Total Entities" value={totals.count} />
            <Kpi label="Reports (24h)" value={totals.reports} />
            <Kpi label="Verification Rate" value="88.4%" />
            <Kpi label="SLA On-Time (avg)" value={`${totals.avgSla}%`} />
          </section>

          <section className="card" style={{ marginTop: 16 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Top Hotspots</h2>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1' }}>
              <li>Phoenix — Illegal dumping cluster (North District)</li>
              <li>LA Unified — Campus safety incidents (South Zone)</li>
              <li>Metro A — Station maintenance failures (Line 4)</li>
            </ul>
          </section>
        </>
      )}

      {tab === 'entities' && (
        <section className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Entity Manager</h2>
            <button className="btn primary">Add Entity</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Entity</th><th>Type</th><th>Status</th><th>Region</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.type}</td>
                  <td>
                    <span className={`badge ${e.status === 'Active' ? 'active' : e.status === 'Trial' ? 'trial' : 'suspended'}`}>{e.status}</span>
                  </td>
                  <td>{e.region}</td>
                  <td>{e.createdAt}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn">Open Dashboard</button>
                    <button className="btn">Settings</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === 'wizard' && (
        <section className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Entity Setup Wizard</h2>
          <ol style={{ color: '#cbd5e1', paddingLeft: 20, lineHeight: 1.9 }}>
            <li>Basic Info: Name, Type, Jurisdiction, Region</li>
            <li>Boundary: Map polygon (optional)</li>
            <li>Modules: Map, Alerts, Evidence Vault, Public Portal</li>
            <li>Taxonomy: Categories + Subcategories</li>
            <li>Routing Rules + SLA Targets</li>
            <li>Roles + User Invites</li>
          </ol>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn">Back</button>
            <button className="btn primary">Continue</button>
          </div>
        </section>
      )}

      {tab === 'roles' && (
        <section className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Roles & Access</h2>
          <table className="table">
            <thead><tr><th>Role</th><th>Permissions</th><th>Scope</th></tr></thead>
            <tbody>
              <tr><td>Platform Admin</td><td>All entities, billing, audit, config</td><td>Global</td></tr>
              <tr><td>Entity Admin</td><td>Entity config, users, routing, SLA</td><td>Tenant</td></tr>
              <tr><td>Moderator</td><td>Review, verify, escalate reports</td><td>Department</td></tr>
              <tr><td>Analyst</td><td>Read metrics, export reports</td><td>Tenant</td></tr>
            </tbody>
          </table>
        </section>
      )}

      {tab === 'routing' && (
        <section className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Routing + SLA</h2>
          <table className="table">
            <thead><tr><th>Category</th><th>Department</th><th>Priority</th><th>SLA</th></tr></thead>
            <tbody>
              <tr><td>Road Hazard</td><td>Public Works</td><td>High</td><td>4h acknowledge / 48h resolve</td></tr>
              <tr><td>School Safety</td><td>Campus Security</td><td>Critical</td><td>30m acknowledge / 12h resolve</td></tr>
              <tr><td>Transit Delay</td><td>Operations Control</td><td>Medium</td><td>2h acknowledge / 24h resolve</td></tr>
            </tbody>
          </table>
        </section>
      )}

      {tab === 'portal' && (
        <section className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Public Portal Settings</h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', lineHeight: 1.9 }}>
            <li>Visibility Mode: Verified-only / Internal-only</li>
            <li>Evidence redaction rules enabled</li>
            <li>Utility-only legal disclosure enforced</li>
            <li>Public dashboard branding per tenant</li>
          </ul>
        </section>
      )}

      {tab === 'audit' && (
        <section className="card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>Audit Log + Billing</h2>
          <table className="table">
            <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Scope</th></tr></thead>
            <tbody>
              <tr><td>2026-02-17 15:30</td><td>platform-admin</td><td>Updated SLA policy</td><td>City of Phoenix</td></tr>
              <tr><td>2026-02-17 15:10</td><td>entity-admin</td><td>Invited moderator</td><td>LA Unified</td></tr>
              <tr><td>2026-02-17 14:58</td><td>system</td><td>Generated monthly invoice</td><td>Metro Transit A</td></tr>
            </tbody>
          </table>
        </section>
      )}

      {tab === 'architecture' && (
        <section className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Platform Architecture Showcase</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn" onClick={() => setArchView('control-plane')} style={{ background: archView === 'control-plane' ? '#0b5fff' : '#0f172a', borderColor: archView === 'control-plane' ? '#0b5fff' : '#334155' }}>Control Plane</button>
              <button className="btn" onClick={() => setArchView('data-plane')} style={{ background: archView === 'data-plane' ? '#0b5fff' : '#0f172a', borderColor: archView === 'data-plane' ? '#0b5fff' : '#334155' }}>Data Plane</button>
              <button className="btn" onClick={() => setArchView('security')} style={{ background: archView === 'security' ? '#0b5fff' : '#0f172a', borderColor: archView === 'security' ? '#0b5fff' : '#334155' }}>Security</button>
              <button className="btn" onClick={() => setArchView('deployment')} style={{ background: archView === 'deployment' ? '#0b5fff' : '#0f172a', borderColor: archView === 'deployment' ? '#0b5fff' : '#334155' }}>Deployment</button>
              <button className="btn" onClick={() => setArchView('integrations')} style={{ background: archView === 'integrations' ? '#0b5fff' : '#0f172a', borderColor: archView === 'integrations' ? '#0b5fff' : '#334155' }}>Integrations</button>
            </div>
          </div>

          {archView === 'control-plane' && (
            <div className="grid" style={{ marginTop: 14 }}>
              <div className="card"><h3>Tenant Registry</h3><p>Source-of-truth entity management for City, School, Transit, Utilities, and Housing tenants.</p></div>
              <div className="card"><h3>Policy Engine</h3><p>Per-tenant modules, category taxonomies, routing, and SLA orchestration via config APIs.</p></div>
              <div className="card"><h3>Governance Console</h3><p>Role-based access for platform-admin, entity-admin, moderators, and analysts.</p></div>
            </div>
          )}

          {archView === 'data-plane' && (
            <div className="grid" style={{ marginTop: 14 }}>
              <div className="card"><h3>Report Lifecycle</h3><p>Strict states: draft → submitted → verified → anchored → certified.</p></div>
              <div className="card"><h3>Evidence Vault V2</h3><p>Chain-of-custody timelines, hashes, signed packet metadata, and verification endpoints.</p></div>
              <div className="card"><h3>Transparency Metrics</h3><p>Cross-entity reporting, verification, SLA performance, and hotspot analytics.</p></div>
            </div>
          )}

          {archView === 'security' && (
            <div className="grid" style={{ marginTop: 14 }}>
              <div className="card"><h3>RBAC + Tenant Isolation</h3><p>Authorization boundaries across tenants, departments, and operational roles.</p></div>
              <div className="card"><h3>Integrity Controls</h3><p>Tamper-evident hashes, anchor references, and immutable audit history.</p></div>
              <div className="card"><h3>Compliance Guardrails</h3><p>Utility-only disclosures, KYC/AML hook points, and policy-driven visibility controls.</p></div>
            </div>
          )}

          {archView === 'deployment' && (
            <div className="grid" style={{ marginTop: 14 }}>
              <div className="card"><h3>Nexus Console</h3><p>Vercel-hosted institutional UI for operations, governance, and demos.</p></div>
              <div className="card"><h3>Nexus API</h3><p>Separate control-plane service with feature flags and tenant configuration endpoints.</p></div>
              <div className="card"><h3>Public DPAL App</h3><p>Runs as tenant-aware client, loading config from Nexus and enforcing policy at runtime.</p></div>
            </div>
          )}

          {archView === 'integrations' && (
            <div className="grid" style={{ marginTop: 14 }}>
              <div className="card"><h3>Open Data Ingestion</h3><p>Adapters for Open311, city GeoJSON, and air quality feed normalization.</p></div>
              <div className="card"><h3>Institution Workflows</h3><p>Routing into departmental queues, escalation paths, and SLA compliance workflows.</p></div>
              <div className="card"><h3>Future Extensions</h3><p>CRM/case-management connectors, regional analytics exports, and public portal syndication.</p></div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

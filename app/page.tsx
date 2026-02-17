import React from 'react';

type Entity = {
  name: string;
  type: 'City' | 'School District' | 'University' | 'Transit Agency';
  status: 'Active' | 'Trial' | 'Suspended';
  region: string;
  createdAt: string;
};

const entities: Entity[] = [
  { name: 'City of Phoenix', type: 'City', status: 'Active', region: 'US-AZ', createdAt: '2026-02-01' },
  { name: 'LA Unified', type: 'School District', status: 'Trial', region: 'US-CA', createdAt: '2026-02-10' },
  { name: 'Metro Transit A', type: 'Transit Agency', status: 'Active', region: 'US-NY', createdAt: '2026-02-15' },
];

export default function HomePage() {
  return (
    <main className="page">
      <h1 style={{ marginTop: 0 }}>DPAL Nexus Console</h1>
      <p style={{ color: '#94a3b8' }}>Source-of-truth institutional control plane for multi-tenant DPAL.</p>

      <section className="grid" style={{ marginTop: 20 }}>
        <div className="card"><div>Total Entities</div><div className="kpi">{entities.length}</div></div>
        <div className="card"><div>Reports (24h)</div><div className="kpi">1,248</div></div>
        <div className="card"><div>Verification Rate</div><div className="kpi">88.4%</div></div>
        <div className="card"><div>SLA On-Time</div><div className="kpi">91.2%</div></div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
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
              <tr key={e.name}>
                <td>{e.name}</td>
                <td>{e.type}</td>
                <td>
                  <span className={`badge ${e.status === 'Active' ? 'active' : 'trial'}`}>{e.status}</span>
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
    </main>
  );
}

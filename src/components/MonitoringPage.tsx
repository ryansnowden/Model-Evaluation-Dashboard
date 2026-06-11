import React from 'react';

export default function MonitoringPage() {
  return (
    <div className="card flex-col gap-4">
      <h2 className="card-title">Production Drift & Health</h2>
      
      <div className="flex gap-4">
        <div className="card" style={{ flex: 1, borderTop: '4px solid var(--accent-orange)' }}>
          <h3 className="card-title" style={{ fontSize: '14px' }}>System Health</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-tp)' }}>99.98%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Uptime last 30 days</div>
        </div>
        <div className="card" style={{ flex: 1, borderTop: '4px solid var(--color-fn)' }}>
          <h3 className="card-title" style={{ fontSize: '14px' }}>Data Drift Alerts</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-fn)' }}>2</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Requires investigation</div>
        </div>
        <div className="card" style={{ flex: 1, borderTop: '4px solid var(--border-color)' }}>
          <h3 className="card-title" style={{ fontSize: '14px' }}>Operator Load</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>14.2</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Alerts / operator / shift</div>
        </div>
      </div>
      
      <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Drift heatmaps and timeline charts will go here.</p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState<'usage' | 'quality' | 'operational'>('usage');

  // Dummy Data for Usage Tab
  const volumeData = [
    { date: 'Oct 01', incidents: 12 },
    { date: 'Oct 02', incidents: 19 },
    { date: 'Oct 03', incidents: 15 },
    { date: 'Oct 04', incidents: 22 },
    { date: 'Oct 05', incidents: 8 },
    { date: 'Oct 06', incidents: 30 },
    { date: 'Oct 07', incidents: 18 }
  ];

  const latencyData = [
    { hour: '00:00', p99: 120, p50: 45 },
    { hour: '04:00', p99: 110, p50: 42 },
    { hour: '08:00', p99: 340, p50: 85 },
    { hour: '12:00', p99: 450, p50: 110 },
    { hour: '16:00', p99: 410, p50: 95 },
    { hour: '20:00', p99: 220, p50: 60 }
  ];

  return (
    <div className="flex-col gap-4">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <div className={"tab " + (activeTab === 'usage' ? 'active' : '')} onClick={() => setActiveTab('usage')}>Usage</div>
          <div className={"tab " + (activeTab === 'quality' ? 'active' : '')} onClick={() => setActiveTab('quality')}>Quality</div>
          <div className={"tab " + (activeTab === 'operational' ? 'active' : '')} onClick={() => setActiveTab('operational')}>Operational</div>
        </div>
      </div>

      {activeTab === 'usage' && (
        <div className="flex-col gap-4">
          <div className="flex gap-4">
            <div className="card" style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Traces</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>1,245</div>
              <div style={{ fontSize: '12px', color: 'var(--color-tp)' }}>↑ 12% vs last week</div>
            </div>
            <div className="card" style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Median Latency</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>85ms</div>
              <div style={{ fontSize: '12px', color: 'var(--color-fp)' }}>↑ 5ms vs last week</div>
            </div>
            <div className="card" style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Overall FAR</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>6.8</div>
              <div style={{ fontSize: '12px', color: 'var(--color-tp)' }}>↓ 52% vs Baseline</div>
            </div>
            <div className="card" style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Cameras</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>33</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>100% online</div>
            </div>
          </div>

          <div className="flex gap-4" style={{ height: '300px' }}>
            <div className="card flex-col" style={{ flex: 2 }}>
              <h3 className="card-title">Incident Volume (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                  <Bar dataKey="incidents" fill="var(--accent-orange)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="card flex-col" style={{ flex: 1 }}>
              <h3 className="card-title">Detection Latency</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="hour" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                  <Line type="monotone" dataKey="p99" name="P99" stroke="var(--color-fn)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="p50" name="P50" stroke="var(--color-tp)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="card">
          <h3 className="card-title">Quality Summary</h3>
          <p>Slice comparison heatmap and metric breakdowns will go here.</p>
        </div>
      )}

      {activeTab === 'operational' && (
        <div className="card">
          <h3 className="card-title">Operational Metrics</h3>
          <p>Operator burden and safety indicators will go here.</p>
        </div>
      )}
    </div>
  );
}

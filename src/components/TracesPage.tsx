import React, { useState } from 'react';
import { mockTraces } from '../data/index';
import { IncidentTrace } from '../types';
import { X, Search, ChevronRight, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function TracesPage() {
  const [selectedTrace, setSelectedTrace] = useState<IncidentTrace | null>(null);
  const [search, setSearch] = useState('');

  const filteredTraces = mockTraces.filter(t => 
    t.trace_id.toLowerCase().includes(search.toLowerCase()) || 
    t.camera_id.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50); // limit to 50 for performance

  return (
    <div className="flex gap-4" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Trace List */}
      <div className="card flex-col" style={{ flex: selectedTrace ? 1 : 2, overflow: 'hidden', marginBottom: 0 }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="card-title" style={{ margin: 0 }}>Incident Traces</h3>
          <div className="flex items-center gap-2" style={{ background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <Search size={14} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search traces..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface)' }}>
              <tr>
                <th>Trace ID</th>
                <th>Camera</th>
                <th>Zone</th>
                <th>Score</th>
                <th>Ground Truth</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTraces.map(trace => (
                <tr 
                  key={trace.trace_id} 
                  onClick={() => setSelectedTrace(trace)}
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: selectedTrace?.trace_id === trace.trace_id ? 'var(--bg-active)' : 'transparent'
                  }}
                >
                  <td style={{ fontWeight: 600, color: 'var(--accent-orange)' }}>{trace.trace_id}</td>
                  <td>{trace.camera_id}</td>
                  <td>{trace.zone_type}</td>
                  <td>
                    <span style={{ 
                      color: trace.anomaly_score > trace.threshold ? 'var(--color-fn)' : 'var(--text-secondary)',
                      fontWeight: trace.anomaly_score > trace.threshold ? 'bold' : 'normal'
                    }}>
                      {(trace.anomaly_score * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <span className="tag" style={{ background: 'var(--bg-hover)' }}>{trace.ground_truth}</span>
                  </td>
                  <td>
                    {trace.tags.includes('true_positive') && <span className="tag tp">TP</span>}
                    {trace.tags.includes('false_positive') && <span className="tag fp">FP</span>}
                    {trace.tags.includes('false_negative') && <span className="tag fn">FN</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedTrace && (
        <div className="card flex-col" style={{ flex: 1, overflowY: 'auto', marginBottom: 0, borderLeft: '2px solid var(--accent-orange)' }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="card-title" style={{ margin: 0, fontSize: '20px' }}>{selectedTrace.trace_id}</h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{new Date(selectedTrace.timestamp).toLocaleString()}</div>
            </div>
            <button className="btn" onClick={() => setSelectedTrace(null)}><X size={16} /></button>
          </div>

          <div className="flex-col gap-6">
            {/* Timeline */}
            <div>
              <h3 className="sidebar-group-title" style={{ padding: 0 }}>SCORE TIMELINE</h3>
              <div style={{ height: '150px', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedTrace.score_raw.map((r, i) => ({ frame: i, raw: r, smooth: selectedTrace.score_smooth[i] }))} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <XAxis dataKey="frame" tick={false} axisLine={false} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                    <ReferenceLine y={selectedTrace.threshold} stroke="var(--color-fp)" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="raw" stroke="var(--text-muted)" strokeWidth={1} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="smooth" stroke="var(--accent-orange)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pipeline Spans */}
            <div>
              <h3 className="sidebar-group-title" style={{ padding: 0 }}>PIPELINE EXECUTION</h3>
              <div className="mt-4 flex-col gap-2">
                {selectedTrace.spans.map((span, i) => (
                  <div key={span.id} className="flex items-center gap-2" style={{ padding: '8px', background: 'var(--bg-hover)', borderRadius: '4px' }}>
                    <Activity size={14} color="var(--text-secondary)" />
                    <div style={{ flex: 1, fontSize: '13px', fontWeight: 500 }}>{span.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{span.duration_ms}ms</div>
                  </div>
                ))}
                <div className="flex justify-between mt-2 pt-2" style={{ borderTop: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 'bold' }}>
                  <span>Total Latency</span>
                  <span style={{ fontFamily: 'monospace' }}>{selectedTrace.spans.reduce((acc, s) => acc + s.duration_ms, 0)}ms</span>
                </div>
              </div>
            </div>

            {/* Operator Actions */}
            <div>
              <h3 className="sidebar-group-title" style={{ padding: 0 }}>OPERATOR TRIAGE</h3>
              <table style={{ fontSize: '13px', marginTop: '10px' }}>
                <tbody>
                  <tr><td style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>Priority</td><td style={{ fontWeight: 'bold' }}>{selectedTrace.priority.toUpperCase()}</td></tr>
                  <tr><td style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>Action Taken</td><td style={{ fontWeight: 'bold' }}>{selectedTrace.operator_action.toUpperCase()}</td></tr>
                  <tr><td style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>Time to Review</td><td style={{ fontWeight: 'bold' }}>{selectedTrace.review_time_sec}s</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

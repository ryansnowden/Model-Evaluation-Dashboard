import React, { useState } from 'react';
import { mockSlices, mockRuns } from '../data/index';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

export default function ModelEvalPanel() {
  const [activeTab, setActiveTab] = useState<'overview' | 'scenario' | 'compare'>('overview');
  const [selectedRun, setSelectedRun] = useState('run-a4');
  
  // Data for Radar Chart
  const radarData = [
    { metric: 'PR-AUC', value: 0.89, fullMark: 1.0 },
    { metric: 'Event F1', value: 0.87, fullMark: 1.0 },
    { metric: 'tIoU', value: 0.78, fullMark: 1.0 },
    { metric: 'Confirm Rate', value: 0.84, fullMark: 1.0 },
    { metric: 'Precision', value: 0.91, fullMark: 1.0 },
    { metric: 'Recall', value: 0.85, fullMark: 1.0 }
  ];

  // Data for Metric Performance Bar Chart
  const classPerformanceData = [
    { name: 'loitering', f1: 0.92, precision: 0.95, recall: 0.89 },
    { name: 'tailgating', f1: 0.85, precision: 0.88, recall: 0.82 },
    { name: 'abandoned_object', f1: 0.81, precision: 0.85, recall: 0.78 },
    { name: 'unauthorized_access', f1: 0.96, precision: 0.98, recall: 0.94 },
    { name: 'slip_and_fall', f1: 0.74, precision: 0.79, recall: 0.70 },
  ];

  // Confusion Matrix Dummy Data
  const matrixData = [
    [45, 2, 0], // True Benign
    [5, 82, 1], // True Actionable
    [8, 3, 14]  // True Unclear
  ];
  const labels = ['Benign', 'Actionable', 'Unclear'];

  return (
    <div className="flex-col gap-4">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="tabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <div className={"tab " + (activeTab === 'overview' ? 'active' : '')} onClick={() => setActiveTab('overview')}>Overview</div>
          <div className={"tab " + (activeTab === 'scenario' ? 'active' : '')} onClick={() => setActiveTab('scenario')}>Scenario Analysis</div>
          <div className={"tab " + (activeTab === 'compare' ? 'active' : '')} onClick={() => setActiveTab('compare')}>Compare Models</div>
        </div>
        <div className="flex gap-2">
          <select 
            className="btn" 
            style={{ backgroundColor: 'var(--bg-surface)' }}
            value={selectedRun}
            onChange={e => setSelectedRun(e.target.value)}
          >
            {mockRuns.map(r => (
              <option key={r.run_id} value={r.run_id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="flex-col gap-4">
          <div className="card">
            <h3 className="card-title">Summary</h3>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Support</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>PR-AUC</td><td>0.890</td><td>250</td></tr>
                <tr><td>F1-Score</td><td>0.875</td><td>250</td></tr>
                <tr><td>Average tIoU</td><td>0.782</td><td>250</td></tr>
                <tr>
                  <td>True Positives</td>
                  <td><span className="tag tp">142</span></td>
                  <td></td>
                </tr>
                <tr>
                  <td>False Positives</td>
                  <td><span className="tag fp">18</span></td>
                  <td></td>
                </tr>
                <tr>
                  <td>False Negatives</td>
                  <td><span className="tag fn">24</span></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex gap-4" style={{ height: '350px' }}>
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 className="card-title">Metric Performance</h3>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fill: 'var(--text-muted)' }} />
                    <Radar name="Model A4" dataKey="value" stroke="var(--accent-orange)" fill="var(--accent-orange)" fillOpacity={0.3} />
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 className="card-title">Class Performance (F1 Score)</h3>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classPerformanceData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 1]} tick={{ fill: 'var(--text-secondary)' }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                    <RechartsTooltip cursor={{ fill: 'var(--bg-hover)' }} contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                    <Bar dataKey="f1" fill="var(--accent-orange)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Confusion Matrices</h3>
            <div className="flex justify-center">
              <div style={{ display: 'inline-block' }}>
                <div className="flex" style={{ paddingLeft: '80px' }}>
                  {labels.map(l => (
                    <div key={l} style={{ width: '80px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {l} (Pred)
                    </div>
                  ))}
                </div>
                {labels.map((rowLabel, i) => (
                  <div key={rowLabel} className="flex items-center">
                    <div style={{ width: '80px', textAlign: 'right', paddingRight: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {rowLabel} (GT)
                    </div>
                    {matrixData[i].map((val, j) => {
                      // Calculate opacity based on value
                      const opacity = Math.max(0.1, val / 100);
                      const isDiagonal = i === j;
                      const bgColor = isDiagonal 
                        ? "rgba(255, 152, 0, " + opacity + ")" // Orange for correct
                        : "rgba(153, 153, 153, " + opacity + ")"; // Grey for incorrect
                      
                      return (
                        <div 
                          key={j} 
                          style={{ 
                            width: '80px', height: '60px', 
                            backgroundColor: bgColor,
                            border: '1px solid var(--border-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            color: opacity > 0.5 ? '#fff' : 'var(--text-primary)'
                          }}
                          title={"GT: " + rowLabel + ", Pred: " + labels[j]}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scenario' && (
        <div className="flex-col gap-4">
          <div className="card flex items-center justify-between">
            <h3 className="card-title" style={{ margin: 0 }}>Scenario Analysis: Performance by Zone Type</h3>
            <select className="btn" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <option>Zone Type</option>
              <option>Time Band</option>
              <option>Day Type</option>
            </select>
          </div>
          
          <div className="flex gap-4" style={{ height: '300px' }}>
            <div className="card flex-col" style={{ flex: 1 }}>
              <h3 className="card-title">Prediction Statistics</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Atrium', tp: 40, fp: 10, fn: 5 },
                  { name: 'Corridor', tp: 35, fp: 2, fn: 8 },
                  { name: 'Parking', tp: 25, fp: 15, fn: 2 },
                  { name: 'Loading', tp: 15, fp: 5, fn: 4 },
                ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} />
                  <YAxis tick={{ fill: 'var(--text-secondary)' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                  <Bar dataKey="tp" stackId="a" fill="var(--color-tp)" />
                  <Bar dataKey="fp" stackId="a" fill="var(--color-fp)" />
                  <Bar dataKey="fn" stackId="a" fill="var(--color-fn)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="card flex-col" style={{ flex: 1 }}>
              <h3 className="card-title">Model Performance (F1 Score)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Atrium', a4: 0.89, baseline: 0.72 },
                  { name: 'Corridor', a4: 0.92, baseline: 0.65 },
                  { name: 'Parking', a4: 0.78, baseline: 0.55 },
                  { name: 'Loading', a4: 0.82, baseline: 0.68 },
                ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)' }} />
                  <YAxis domain={[0, 1]} tick={{ fill: 'var(--text-secondary)' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                  <Bar dataKey="a4" name="A4: Full Stack" fill="var(--accent-orange)" />
                  <Bar dataKey="baseline" name="Baseline" fill="var(--text-muted)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="flex-col gap-4">
          <div className="card flex items-center gap-4">
            <h3 className="card-title" style={{ margin: 0 }}>Compare Against:</h3>
            <select className="btn" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <option>Baseline (Frame-level)</option>
              <option>A1: Memory-guided</option>
              <option>A2: Temporal Smoothing</option>
              <option>A3: Event Persistence</option>
            </select>
          </div>
          
          <div className="flex gap-4">
            <div className="card" style={{ flex: 1 }}>
              <h3 className="card-title">Metric Comparison</h3>
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Model A4</th>
                    <th>Baseline</th>
                    <th>Delta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>PR-AUC</td><td>0.890</td><td>0.720</td><td style={{color: 'var(--color-tp)'}}>+0.170</td></tr>
                  <tr><td>Event F1</td><td>0.875</td><td>0.680</td><td style={{color: 'var(--color-tp)'}}>+0.195</td></tr>
                  <tr><td>Average tIoU</td><td>0.782</td><td>0.420</td><td style={{color: 'var(--color-tp)'}}>+0.362</td></tr>
                  <tr><td>FAR / 100h</td><td>6.8</td><td>14.2</td><td style={{color: 'var(--color-tp)'}}>-7.4</td></tr>
                  <tr><td>Confirm Rate</td><td>0.84</td><td>0.61</td><td style={{color: 'var(--color-tp)'}}>+0.23</td></tr>
                </tbody>
              </table>
            </div>

            <div className="card flex-col" style={{ flex: 1, height: '350px' }}>
              <h3 className="card-title">Overlay Performance</h3>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                  { metric: 'PR-AUC', a4: 0.89, base: 0.72, fullMark: 1.0 },
                  { metric: 'Event F1', a4: 0.87, base: 0.68, fullMark: 1.0 },
                  { metric: 'tIoU', a4: 0.78, base: 0.42, fullMark: 1.0 },
                  { metric: 'Confirm Rate', a4: 0.84, base: 0.61, fullMark: 1.0 },
                  { metric: 'Precision', a4: 0.91, base: 0.70, fullMark: 1.0 },
                  { metric: 'Recall', a4: 0.85, base: 0.65, fullMark: 1.0 }
                ]}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fill: 'transparent' }} />
                  <Radar name="Model A4" dataKey="a4" stroke="var(--accent-orange)" fill="var(--accent-orange)" fillOpacity={0.3} />
                  <Radar name="Baseline" dataKey="base" stroke="var(--text-secondary)" fill="var(--text-secondary)" fillOpacity={0.3} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

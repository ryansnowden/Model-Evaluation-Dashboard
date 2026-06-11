import React, { useState } from 'react';
import { mockRuns } from '../data/index';

export default function AblationRunsPage() {
  const [selectedRuns, setSelectedRuns] = useState<Set<string>>(new Set(['run-baseline', 'run-a4']));

  const toggleRun = (id: string) => {
    const newSet = new Set(selectedRuns);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRuns(newSet);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="card-title" style={{ margin: 0 }}>Ablation Runs</h2>
        <button className="btn btn-primary" disabled={selectedRuns.size < 2}>Compare Selected ({selectedRuns.size})</button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Compare</th>
            <th>Run ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>PR-AUC</th>
            <th>F1 Score</th>
            <th>tIoU</th>
            <th>FAR / 100h</th>
            <th>Confirm Rate</th>
          </tr>
        </thead>
        <tbody>
          {mockRuns.map(run => (
            <tr key={run.run_id} style={{ backgroundColor: selectedRuns.has(run.run_id) ? 'var(--bg-hover)' : 'transparent' }}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedRuns.has(run.run_id)} 
                  onChange={() => toggleRun(run.run_id)} 
                />
              </td>
              <td style={{ color: 'var(--text-secondary)' }}>{run.run_id}</td>
              <td style={{ fontWeight: 600 }}>{run.name}</td>
              <td><span className="tag tp">{run.status}</span></td>
              <td>{run.pr_auc.toFixed(3)}</td>
              <td>{run.f1_score.toFixed(3)}</td>
              <td>{run.tiou.toFixed(3)}</td>
              <td>{run.far_per_100h.toFixed(1)}</td>
              <td>{(run.confirmation_rate * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

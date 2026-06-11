import React from 'react';
import { mockSlices } from '../data/index';

export default function LabelingStatusPage() {
  return (
    <div className="card flex-col gap-4">
      <h2 className="card-title">Labeling & Annotation Status</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Track ground-truth annotation progress across benchmark slices.</p>
      
      <table>
        <thead>
          <tr>
            <th>Slice</th>
            <th>Total Events</th>
            <th>Labelled</th>
            <th>Reviewed</th>
            <th>Approved</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          {mockSlices.map((slice, i) => {
            const labelled = Math.floor(slice.total_events * (1 - i * 0.05));
            const reviewed = Math.floor(labelled * 0.9);
            const approved = Math.floor(reviewed * 0.85);
            const coverage = (labelled / slice.total_events) * 100;
            
            return (
              <tr key={slice.slice_id}>
                <td style={{ fontWeight: 600 }}>{slice.name}</td>
                <td>{slice.total_events}</td>
                <td>{labelled}</td>
                <td>{reviewed}</td>
                <td style={{ color: 'var(--color-tp)', fontWeight: 'bold' }}>{approved}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div style={{ width: '100px', height: '6px', background: 'var(--bg-hover)', borderRadius: '3px' }}>
                      <div style={{ width: coverage + '%', height: '100%', background: coverage > 95 ? 'var(--color-tp)' : 'var(--accent-orange)', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '12px' }}>{coverage.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import React from 'react';
import { mockGates } from '../data/index';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

export default function PassFailGatesPage() {
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pass': return <CheckCircle color="var(--color-tp)" size={18} />;
      case 'fail': return <XCircle color="var(--color-fp)" size={18} />;
      case 'warning': return <AlertTriangle color="var(--color-fn)" size={18} />;
      default: return <Clock color="var(--text-secondary)" size={18} />;
    }
  };

  const getReviewBadge = (status: string) => {
    let bg = 'var(--bg-hover)';
    let color = 'var(--text-secondary)';
    
    if (status === 'approved') { bg = 'rgba(76, 175, 80, 0.2)'; color = 'var(--color-tp)'; }
    if (status === 'changes_requested') { bg = 'rgba(244, 67, 54, 0.2)'; color = 'var(--color-fp)'; }
    if (status === 'in_review') { bg = 'rgba(255, 152, 0, 0.2)'; color = 'var(--color-fn)'; }

    return (
      <span style={{ 
        background: bg, color: color, padding: '4px 8px', 
        borderRadius: '4px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' 
      }}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="card">
      <h2 className="card-title">Pass/Fail Gates</h2>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Gate Name</th>
            <th>Track</th>
            <th>Requirement</th>
            <th>Evidence (Model A4)</th>
            <th>Review Status</th>
          </tr>
        </thead>
        <tbody>
          {mockGates.map(gate => (
            <tr key={gate.id}>
              <td>{getStatusIcon(gate.status)}</td>
              <td style={{ fontWeight: 600 }}>{gate.name}</td>
              <td><span className="tag" style={{ background: 'var(--bg-hover)' }}>{gate.track}</span></td>
              <td style={{ color: 'var(--text-secondary)' }}>{gate.requirement}</td>
              <td>{gate.evidence}</td>
              <td>{getReviewBadge(gate.review_status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

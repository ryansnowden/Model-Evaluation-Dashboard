import React from 'react';
import { Activity, ShieldCheck, Target, AlertTriangle } from 'lucide-react';
import { IncidentTrace, ModelConfig, GateRequirement } from '../types';

interface KPIRibbonProps {
  traces: IncidentTrace[];
  models: ModelConfig[];
  gates: GateRequirement[];
}

export default function KPIRibbon({ traces, models, gates }: KPIRibbonProps) {
  const candidateModel = models.find(m => m.is_candidate);
  
  // Calculate Global F1 for Candidate
  // Just mock stats based on traces for now, or hardcode typical values
  const totalTraces = traces.length;
  
  // Determine Gate Status
  const rejectedGates = gates.filter(g => g.review_status === 'rejected');
  const pendingGates = gates.filter(g => g.review_status === 'pending');
  const gateStatus = rejectedGates.length > 0 ? 'FAIL' : pendingGates.length > 0 ? 'PENDING' : 'PASS';
  const gateColor = gateStatus === 'PASS' ? 'var(--color-pass)' : gateStatus === 'FAIL' ? 'var(--color-fail)' : 'var(--color-warn)';
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 16,
      marginBottom: 32,
    }}>
      {/* Metric 1: System Status */}
      <div className="card" style={{ padding: 16, borderTop: `3px solid ${gateColor}` }}>
        <div className="flex items-center gap-3">
          <div style={{ background: 'var(--bg-hover)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
            <ShieldCheck size={20} color={gateColor} />
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Release Status</div>
            <div className="font-mono font-semibold" style={{ fontSize: 20, color: gateColor }}>{gateStatus}</div>
          </div>
        </div>
      </div>

      {/* Metric 2: Global F1 Score */}
      <div className="card" style={{ padding: 16 }}>
        <div className="flex items-center gap-3">
          <div style={{ background: 'var(--color-pass-muted)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
            <Target size={20} color="var(--color-pass)" />
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Candidate F1</div>
            <div className="font-mono font-semibold" style={{ fontSize: 20 }}>
              {candidateModel ? (candidateModel.f1_score * 100).toFixed(1) + '%' : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Metric 3: False Alarm Rate */}
      <div className="card" style={{ padding: 16 }}>
        <div className="flex items-center gap-3">
          <div style={{ background: 'var(--color-warn-muted)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
            <AlertTriangle size={20} color="var(--color-warn)" />
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>False Alarms</div>
            <div className="font-mono font-semibold" style={{ fontSize: 20 }}>
              {candidateModel ? candidateModel.far_per_100h : '--'} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 100h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric 4: Traces Processed */}
      <div className="card" style={{ padding: 16 }}>
        <div className="flex items-center gap-3">
          <div style={{ background: 'var(--accent-glow)', padding: 8, borderRadius: 'var(--radius-sm)' }}>
            <Activity size={20} color="var(--accent)" />
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Traces Processed</div>
            <div className="font-mono font-semibold" style={{ fontSize: 20 }}>{totalTraces}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

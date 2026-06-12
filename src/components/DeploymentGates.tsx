import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Rocket, ShieldAlert } from 'lucide-react';
import { GateRequirement, DataCoverage } from '../types';

interface DeploymentGatesProps {
  gates: GateRequirement[];
  coverage: DataCoverage;
}

export default function DeploymentGates({ gates, coverage }: DeploymentGatesProps) {
  const allPass = gates.every(g => g.status === 'pass');
  const hasFailure = gates.some(g => g.status === 'fail');
  const hasWarning = gates.some(g => g.status === 'warning');

  const coveragePct = coverage.total_traces > 0
    ? Math.round((coverage.approved / coverage.total_traces) * 100)
    : 0;

  const labelledPct = coverage.total_traces > 0
    ? Math.round((coverage.labelled / coverage.total_traces) * 100) : 0;
  const reviewedPct = coverage.total_traces > 0
    ? Math.round((coverage.reviewed / coverage.total_traces) * 100) : 0;

  return (
    <div className="flex-col gap-4">
      {/* Verdict Banner */}
      <div className={`verdict-banner ${hasFailure ? 'verdict-blocked' : 'verdict-ship'}`}>
        {hasFailure ? (
          <>
            <ShieldAlert size={20} />
            <span>BLOCKED — {gates.filter(g => g.status === 'fail').length} gate(s) failing</span>
          </>
        ) : hasWarning ? (
          <>
            <AlertTriangle size={20} />
            <span style={{ color: 'var(--color-warn)' }}>CONDITIONAL — {gates.filter(g => g.status === 'warning').length} warning(s) require review</span>
          </>
        ) : (
          <>
            <Rocket size={20} />
            <span>READY TO SHIP — All {gates.length} gates pass</span>
          </>
        )}
      </div>

      <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>
        {/* Gate Checklist */}
        <div className="flex-col gap-2 flex-1">
          {gates.map(gate => (
            <div key={gate.id} className="gate-row">
              <div className={`gate-icon ${gate.status}`}>
                {gate.status === 'pass' ? <CheckCircle size={14} /> :
                 gate.status === 'fail' ? <XCircle size={14} /> :
                 <AlertTriangle size={14} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{gate.name}</span>
                  <span className="badge badge-neutral" style={{ fontSize: 9 }}>{gate.track}</span>
                </div>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                  {gate.requirement}
                </div>
              </div>
              <div className="flex-col items-center shrink-0" style={{ textAlign: 'right', minWidth: 70 }}>
                <span className="font-mono font-bold text-sm" style={{
                  color: gate.status === 'pass' ? 'var(--color-pass)' :
                         gate.status === 'fail' ? 'var(--color-fail)' : 'var(--color-warn)',
                }}>
                  {gate.actual_value}
                </span>
                <span className="text-muted font-mono" style={{ fontSize: 10 }}>{gate.threshold}</span>
              </div>
              <div className="shrink-0">
                <span className={`badge ${
                  gate.review_status === 'approved' ? 'badge-pass' :
                  gate.review_status === 'rejected' ? 'badge-fail' : 'badge-neutral'
                }`} style={{ fontSize: 9 }}>
                  {gate.review_status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Data Coverage */}
        <div className="card shrink-0" style={{ width: 220, padding: 16 }}>
          <div className="card-title" style={{ marginBottom: 12 }}>Data Coverage</div>

          {/* Coverage ring (simple bar alternative) */}
          <div className="flex-col gap-3">
            <CoverageBar label="Approved" count={coverage.approved} total={coverage.total_traces} color="var(--color-pass)" />
            <CoverageBar label="Reviewed" count={coverage.reviewed} total={coverage.total_traces} color="var(--color-info)" />
            <CoverageBar label="Labelled" count={coverage.labelled} total={coverage.total_traces} color="var(--accent)" />
            <CoverageBar label="Total" count={coverage.total_traces} total={coverage.total_traces} color="var(--text-muted)" />
          </div>

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <div className="flex justify-between items-center">
              <span className="text-muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}>Approval Rate</span>
              <span className="font-mono font-bold" style={{ fontSize: 18, color: coveragePct >= 70 ? 'var(--color-pass)' : 'var(--color-warn)' }}>
                {coveragePct}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoverageBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: 3 }}>
        <span className="text-xs text-secondary">{label}</span>
        <span className="font-mono text-xs font-semibold">{count}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-hover)' }}>
        <div style={{
          height: '100%', borderRadius: 2, background: color,
          width: `${pct}%`, transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}

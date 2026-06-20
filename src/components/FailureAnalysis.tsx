import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { IncidentTrace, ModelConfig } from '../types';
import { computeConfusion, computeF1ByZone, computeF1ByTimeBand, computeF1ByScenario } from '../data/index';

interface FailureAnalysisProps {
  traces: IncidentTrace[];
  models: ModelConfig[];
  selectedModels: string[];
}

export function ConfusionMatricesPanel({ traces, visibleModels }: { traces: IncidentTrace[], visibleModels: ModelConfig[] }) {
  const confusions = useMemo(() => {
    return visibleModels.map(m => ({
      model: m,
      ...computeConfusion(traces, m.run_id),
    }));
  }, [traces, visibleModels]);

  return (
    <div className="flex gap-4 flex-1 flex-wrap">
      {confusions.map(({ model, tp, fp, fn, tn }) => {
        const total = tp + fp + fn + tn || 1;
        return (
          <div key={model.run_id} className="card" style={{ flex: '1 1 200px', minWidth: 200, padding: 16 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: model.color }} />
              <span className="text-sm font-semibold">{model.short_name}</span>
              {model.is_candidate && (
                <span className="badge badge-pass" style={{ fontSize: 9, padding: '1px 5px' }}>candidate</span>
              )}
            </div>
            <div className="confusion-grid" style={{ gridTemplateColumns: '48px 1fr 1fr' }}>
              {/* Header row */}
              <div />
              <div className="confusion-label" style={{ justifyContent: 'center', fontSize: 9 }}>PRED +</div>
              <div className="confusion-label" style={{ justifyContent: 'center', fontSize: 9 }}>PRED −</div>

              {/* Row 1: Actual Positive */}
              <div className="confusion-label" style={{ fontSize: 9 }}>GT +</div>
              <div className="confusion-cell" style={{ background: 'var(--color-pass-muted)', color: 'var(--color-pass)' }}>
                {tp}
                <span className="cell-label">TP</span>
              </div>
              <div className="confusion-cell" style={{ background: fn > 0 ? 'var(--color-warn-muted)' : 'var(--bg-hover)', color: fn > 0 ? 'var(--color-warn)' : 'var(--text-muted)' }}>
                {fn}
                <span className="cell-label">FN</span>
              </div>

              {/* Row 2: Actual Negative */}
              <div className="confusion-label" style={{ fontSize: 9 }}>GT −</div>
              <div className="confusion-cell" style={{ background: fp > 0 ? 'var(--color-fail-muted)' : 'var(--bg-hover)', color: fp > 0 ? 'var(--color-fail)' : 'var(--text-muted)' }}>
                {fp}
                <span className="cell-label">FP</span>
              </div>
              <div className="confusion-cell" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                {tn}
                <span className="cell-label">TN</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ZoneTimeHeatmapPanel({ traces, candidateModel, candidateId }: { traces: IncidentTrace[], candidateModel: ModelConfig, candidateId: string }) {
  const zones = useMemo(() => Array.from(new Set(traces.map(t => t.zone_type))), [traces]);
  const timeBands = useMemo(() => Array.from(new Set(traces.map(t => t.time_band))), [traces]);

  const heatmapData = useMemo(() => {
    if (!candidateId) return [];
    return zones.map(zone => {
      const row: Record<string, any> = { zone };
      timeBands.forEach(band => {
        const subset = traces.filter(t => t.zone_type === zone && t.time_band === band);
        const { tp, fp, fn } = computeConfusion(subset, candidateId);
        const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
        const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
        const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
        row[band] = f1;
        row[`${band}_count`] = subset.length;
      });
      return row;
    });
  }, [traces, candidateId, zones, timeBands]);

  const getHeatColor = (f1: number): string => {
    if (f1 >= 0.85) return 'var(--color-pass)';
    if (f1 >= 0.70) return 'var(--color-warn)';
    if (f1 >= 0.40) return 'var(--color-fail)';
    return 'var(--text-muted)';
  };

  const getHeatBg = (f1: number): string => {
    if (f1 >= 0.85) return 'var(--color-pass-muted)';
    if (f1 >= 0.70) return 'var(--color-warn-muted)';
    if (f1 >= 0.40) return 'var(--color-fail-muted)';
    return 'var(--bg-hover)';
  };

  return (
    <div className="card flex-1" style={{ padding: 16 }}>
      <div className="card-title">
        Zone × Time F1 — {candidateModel?.short_name || 'N/A'}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 3 }}>
          <thead>
            <tr>
              <th style={{ border: 'none', padding: '4px 8px' }}></th>
              {timeBands.map(band => (
                <th key={band} style={{ border: 'none', padding: '4px 8px', fontSize: 9, textAlign: 'center' }}>
                  {band}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map(row => (
              <tr key={row.zone}>
                <td style={{ border: 'none', padding: '4px 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  {row.zone}
                </td>
                {timeBands.map(band => {
                  const f1 = row[band] as number;
                  const count = row[`${band}_count`] as number;
                  return (
                    <td key={band} style={{ border: 'none', padding: 0 }}>
                      <div
                        className="heatmap-cell"
                        style={{
                          background: count > 0 ? getHeatBg(f1) : 'var(--bg-hover)',
                          color: count > 0 ? getHeatColor(f1) : 'var(--text-muted)',
                        }}
                        title={`${row.zone} / ${band}: F1=${f1.toFixed(2)}, n=${count}`}
                      >
                        {count > 0 ? (f1 * 100).toFixed(0) : '—'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-3 items-center" style={{ marginTop: 8 }}>
        <span className="text-muted" style={{ fontSize: 10 }}>F1 Score:</span>
        <span className="flex items-center gap-1" style={{ fontSize: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-pass-muted)', border: '1px solid rgba(16,185,129,0.3)' }} /> ≥85
        </span>
        <span className="flex items-center gap-1" style={{ fontSize: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-warn-muted)', border: '1px solid rgba(245,158,11,0.3)' }} /> 70-84
        </span>
        <span className="flex items-center gap-1" style={{ fontSize: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-fail-muted)', border: '1px solid rgba(239,68,68,0.3)' }} /> &lt;70
        </span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
      borderRadius: 'var(--radius-md)', padding: 12, fontSize: 12,
    }}>
      <div className="font-semibold" style={{ marginBottom: 6, textTransform: 'capitalize' }}>{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2" style={{ marginBottom: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, display: 'inline-block' }} />
          <span className="text-secondary">{entry.name}:</span>
          <span className="font-mono font-semibold">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
};

export function ScenarioBarChartPanel({ traces, visibleModels }: { traces: IncidentTrace[], visibleModels: ModelConfig[] }) {
  const scenarioData = useMemo(() => {
    const scenarios = Array.from(new Set(traces.map(t => t.scenario_label)));
    return scenarios.map(scenario => {
      const row: Record<string, any> = { scenario: scenario.replace(/_/g, ' ') };
      visibleModels.forEach(m => {
        const scenTraces = traces.filter(t => t.scenario_label === scenario);
        const { tp, fp, fn } = computeConfusion(scenTraces, m.run_id);
        const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
        const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
        const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
        row[m.short_name] = Math.round(f1 * 100);
      });
      return row;
    });
  }, [traces, visibleModels]);

  return (
    <div className="card flex-1" style={{ padding: 16 }}>
      <div className="card-title">F1 by Scenario</div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={scenarioData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis dataKey="scenario" type="category" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={110} />
            <Tooltip content={<CustomTooltip />} />
            {visibleModels.map(m => (
              <Bar key={m.run_id} dataKey={m.short_name} fill={m.color} radius={[0, 3, 3, 0]} barSize={8} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ErrorBreakdownSummary({ traces }: { traces: IncidentTrace[] }) {
  const fpCount = traces.filter(t => t.tags.includes('false_positive')).length;
  const fnCount = traces.filter(t => t.tags.includes('false_negative')).length;
  
  return (
    <div data-testid="error-breakdown-summary" className="card" style={{ padding: '12px 20px', minWidth: 250 }}>
      <div className="card-title" style={{ marginBottom: 6, fontSize: '0.85rem' }}>Error Breakdown Summary</div>
      <div className="flex gap-8">
        <div className="flex flex-col">
          <span className="text-muted text-sm">Total Traces</span>
          <span className="font-semibold text-lg">{traces.length}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm" style={{ color: 'var(--color-fail)' }}>False Positives</span>
          <span className="font-semibold text-lg">{fpCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm" style={{ color: 'var(--color-warn)' }}>False Negatives</span>
          <span className="font-semibold text-lg">{fnCount}</span>
        </div>
      </div>
    </div>
  );
}

export default function FailureAnalysis({ traces, models, selectedModels }: FailureAnalysisProps) {
  const [filter, setFilter] = useState<string>('all');
  
  const visibleModels = models.filter(m => selectedModels.includes(m.run_id));
  const candidateId = selectedModels[selectedModels.length - 1] || selectedModels[0];
  const candidateModel = models.find(m => m.run_id === candidateId);

  const filteredTraces = useMemo(() => {
    if (filter === 'all') return traces;
    if (filter === 'fp') return traces.filter(t => t.tags.includes('false_positive'));
    if (filter === 'fn') return traces.filter(t => t.tags.includes('false_negative'));
    return traces;
  }, [traces, filter]);

  return (
    <div className="flex-col gap-4">
      <div className="flex justify-between items-center mb-4 w-full flex-wrap gap-4">
        <ErrorBreakdownSummary traces={traces} />
        
        <div data-testid="category-filters" className="flex items-center gap-2">
          <button 
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Traces
            <span className="pill-count">{traces.length}</span>
          </button>
          <button 
            className={`filter-pill filter-pill--fail ${filter === 'fp' ? 'active' : ''}`}
            onClick={() => setFilter('fp')}
          >
            False Positives
            <span className="pill-count">{traces.filter(t => t.tags.includes('false_positive')).length}</span>
          </button>
          <button 
            className={`filter-pill filter-pill--warn ${filter === 'fn' ? 'active' : ''}`}
            onClick={() => setFilter('fn')}
          >
            False Negatives
            <span className="pill-count">{traces.filter(t => t.tags.includes('false_negative')).length}</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>
        {/* Confusion Matrices */}
        <ConfusionMatricesPanel traces={filteredTraces} visibleModels={visibleModels} />
      </div>

      <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>
        {/* Zone × Time Heatmap */}
        {candidateModel && (
          <ZoneTimeHeatmapPanel traces={filteredTraces} candidateModel={candidateModel} candidateId={candidateId} />
        )}
        
        {/* Scenario F1 Bar Chart */}
        <ScenarioBarChartPanel traces={filteredTraces} visibleModels={visibleModels} />
      </div>
    </div>
  );
}


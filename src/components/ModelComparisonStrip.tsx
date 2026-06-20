import React from 'react';
import { ModelConfig } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ModelComparisonStripProps {
  models: ModelConfig[];
  selectedModels: string[];
  onToggleModel: (runId: string) => void;
}

const METRICS: { key: keyof ModelConfig; label: string; format: (v: number) => string; lowerIsBetter?: boolean }[] = [
  { key: 'pr_auc', label: 'PR-AUC', format: v => v.toFixed(3) },
  { key: 'f1_score', label: 'F1', format: v => v.toFixed(3) },
  { key: 'tiou', label: 'tIoU', format: v => v.toFixed(3) },
  { key: 'precision', label: 'Precision', format: v => (v * 100).toFixed(1) + '%' },
  { key: 'recall', label: 'Recall', format: v => (v * 100).toFixed(1) + '%' },
  { key: 'far_per_100h', label: 'FAR/100h', format: v => v.toFixed(1), lowerIsBetter: true },
  { key: 'confirmation_rate', label: 'Confirm Rate', format: v => (v * 100).toFixed(0) + '%' },
];

export default function ModelComparisonStrip({ models, selectedModels, onToggleModel }: ModelComparisonStripProps) {
  const visibleModels = models.filter(m => selectedModels.includes(m.run_id));
  const baseline = models.find(m => m.run_id === 'run-baseline');

  // Find winner per metric
  const winners: Record<string, string> = {};
  METRICS.forEach(metric => {
    let bestId = '';
    let bestVal = metric.lowerIsBetter ? Infinity : -Infinity;
    visibleModels.forEach(m => {
      const val = m[metric.key] as number;
      if (metric.lowerIsBetter ? val < bestVal : val > bestVal) {
        bestVal = val;
        bestId = m.run_id;
      }
    });
    winners[metric.key] = bestId;
  });

  return (
    <div className="flex-col gap-4">
      {/* Model Selector Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 4 }}>
          Models:
        </span>
        {models.map(model => (
          <button
            key={model.run_id}
            className={`model-pill ${selectedModels.includes(model.run_id) ? 'selected' : ''}`}
            onClick={() => onToggleModel(model.run_id)}
          >
            <span className="pill-dot" style={{ background: model.color }} />
            <span>{model.short_name}</span>
            {model.is_candidate && (
              <span style={{ fontSize: 9, color: 'var(--color-pass)', fontWeight: 700 }}>★</span>
            )}
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-scroll-container">
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: 16 }}>Model</th>
                {METRICS.map(m => (
                  <th key={m.key} style={{ textAlign: 'right' }}>{m.label}</th>
                ))}
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleModels.map(model => (
                <tr key={model.run_id} className={model.is_candidate ? 'row-highlight' : ''}>
                  <td style={{ paddingLeft: 16 }}>
                    <div className="flex items-center gap-2">
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: model.color, flexShrink: 0 }} />
                      <span className="font-semibold text-sm">{model.name}</span>
                      {model.is_candidate && (
                        <span className="badge badge-pass" style={{ fontSize: 9, padding: '1px 5px' }}>candidate</span>
                      )}
                    </div>
                  </td>
                  {METRICS.map(metric => {
                    const val = model[metric.key] as number;
                    const isWinner = winners[metric.key] === model.run_id && visibleModels.length > 1;
                    const baseVal = baseline ? baseline[metric.key] as number : null;
                    const delta = baseVal !== null ? val - baseVal : null;
                    const isImproved = delta !== null && (metric.lowerIsBetter ? delta < -0.001 : delta > 0.001);
                    const isRegressed = delta !== null && (metric.lowerIsBetter ? delta > 0.001 : delta < -0.001);

                    return (
                      <td key={metric.key} style={{ textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-2">
                          {/* Delta vs baseline */}
                          {delta !== null && model.run_id !== 'run-baseline' && (
                            <span className={`metric-delta ${isImproved ? 'positive' : isRegressed ? 'negative' : 'neutral'}`}>
                              {metric.lowerIsBetter
                                ? (delta > 0 ? '+' : '') + delta.toFixed(1)
                                : (delta > 0 ? '+' : '') + (delta * (metric.key === 'far_per_100h' ? 1 : 100)).toFixed(1)
                              }
                            </span>
                          )}
                          <span
                            className="font-mono font-semibold"
                            style={{
                              fontSize: 13,
                              padding: isWinner ? '2px 6px' : undefined,
                              borderRadius: isWinner ? 'var(--radius-sm)' : undefined,
                              background: isWinner ? 'var(--color-pass-muted)' : undefined,
                              color: isWinner ? 'var(--color-pass)' : 'var(--text-primary)',
                            }}
                          >
                            {metric.format(val)}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${model.status === 'completed' ? 'badge-pass' : model.status === 'running' ? 'badge-info' : 'badge-fail'}`}>
                      {model.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

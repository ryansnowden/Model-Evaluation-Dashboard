import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { IncidentTrace, ModelConfig } from '../types';

interface TraceDetailPanelProps {
  trace: IncidentTrace | null;
  models: ModelConfig[];
  onClose: () => void;
}

export default function TraceDetailPanel({ trace, models, onClose }: TraceDetailPanelProps) {
  if (!trace) return null;

  const totalLatency = trace.spans.reduce((acc, s) => acc + s.duration_ms, 0);
  const maxSpanEnd = Math.max(...trace.spans.map(s => s.start_time_ms + s.duration_ms));

  const timelineData = trace.score_raw.map((r, i) => ({
    frame: i,
    raw: r,
    smooth: trace.score_smooth[i],
  }));

  return (
    <AnimatePresence>
      <motion.div
        className="detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="detail-panel"
        initial={{ x: 520 }}
        animate={{ x: 0 }}
        exit={{ x: 520 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="detail-header">
          <div>
            <div className="font-mono font-bold" style={{ fontSize: 15 }}>{trace.trace_id}</div>
            <div className="text-xs text-secondary" style={{ marginTop: 2 }}>
              {trace.camera_id} · {trace.zone_type} · {trace.time_band}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-hover)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)', padding: '6px', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="detail-body flex-col gap-6">
          {/* Context row */}
          <div className="flex gap-3 flex-wrap">
            <div className="badge badge-neutral">{trace.ground_truth}</div>
            <div className="badge badge-neutral">{trace.scenario_label.replace(/_/g, ' ')}</div>
            <div className="badge badge-neutral">{trace.day_type}</div>
            <div className="badge badge-neutral">{trace.priority}</div>
            {trace.tags.map(tag => {
              const cls = tag === 'true_positive' ? 'badge-pass' :
                tag === 'false_positive' ? 'badge-fail' :
                tag === 'false_negative' ? 'badge-warn' : 'badge-neutral';
              return <div key={tag} className={`badge ${cls}`}>{tag.replace(/_/g, ' ')}</div>;
            })}
          </div>

          {/* Score Timeline */}
          <div>
            <div className="card-title">
              <Activity size={14} /> Score Timeline
            </div>
            <div style={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <XAxis dataKey="frame" tick={false} axisLine={false} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={trace.threshold} stroke="var(--color-fail)" strokeDasharray="4 4" strokeWidth={1} />
                  <Line type="monotone" dataKey="raw" stroke="var(--text-muted)" strokeWidth={1} dot={false} isAnimationActive={false} opacity={0.4} />
                  <Line type="monotone" dataKey="smooth" stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-xs" style={{ marginTop: 4 }}>
              <span className="text-muted">Threshold: <span className="font-mono" style={{ color: 'var(--color-fail)' }}>{trace.threshold.toFixed(2)}</span></span>
              <span className="text-muted">Peak: <span className="font-mono" style={{ color: 'var(--accent)' }}>{trace.anomaly_score.toFixed(2)}</span></span>
            </div>
          </div>

          {/* Pipeline Execution (Flame Chart) */}
          <div>
            <div className="card-title">Pipeline Execution · {totalLatency}ms</div>
            <div className="flex-col gap-1">
              {trace.spans.map(span => {
                const widthPct = Math.max(8, (span.duration_ms / maxSpanEnd) * 100);
                const leftPct = (span.start_time_ms / maxSpanEnd) * 100;
                return (
                  <div key={span.id} style={{ position: 'relative', height: 28 }}>
                    <div
                      className="span-bar"
                      style={{
                        position: 'absolute',
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                      }}
                    >
                      {span.name} · {span.duration_ms}ms
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per-Model Score Comparison */}
          <div>
            <div className="card-title">Model Scores for this Trace</div>
            <div className="flex-col gap-3">
              {models.map(model => {
                const detected = trace.model_detections[model.run_id] ?? false;
                const confidence = trace.metrics[model.run_id]?.confidence ?? 0;

                return (
                  <div key={model.run_id}>
                    <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
                      <div className="flex items-center gap-2">
                        <span className="pill-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: model.color, display: 'inline-block' }} />
                        <span className="text-xs font-semibold">{model.short_name}</span>
                        {detected ? (
                          <span className="badge badge-pass" style={{ fontSize: 9, padding: '1px 5px' }}>DETECTED</span>
                        ) : (
                          <span className="badge badge-neutral" style={{ fontSize: 9, padding: '1px 5px' }}>SILENT</span>
                        )}
                      </div>
                      <span className="font-mono text-xs" style={{ color: model.color }}>
                        {confidence.toFixed(2)}
                      </span>
                    </div>
                    <div className="score-gauge">
                      <div
                        className="score-gauge-fill"
                        style={{
                          width: `${Math.min(100, confidence * 100)}%`,
                          background: detected ? model.color : 'var(--text-muted)',
                          opacity: detected ? 1 : 0.3,
                        }}
                      />
                      <div className="score-gauge-threshold" style={{ left: `${trace.threshold * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operator Triage */}
          <div>
            <div className="card-title">Operator Triage</div>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="flex-col gap-1">
                <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Action</span>
                <span className="font-mono text-xs font-semibold">{trace.operator_action.replace(/_/g, ' ').toUpperCase()}</span>
              </div>
              <div className="flex-col gap-1">
                <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Review Time</span>
                <span className="font-mono text-xs font-semibold">{trace.review_time_sec}s</span>
              </div>
              <div className="flex-col gap-1">
                <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Priority</span>
                <span className="font-mono text-xs font-semibold">{trace.priority.toUpperCase()}</span>
              </div>
              <div className="flex-col gap-1">
                <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Annotation</span>
                <span className="font-mono text-xs font-semibold">{trace.annotation_status.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import {
  BookOpen, BarChart3, AlertTriangle, Rocket, Database, Activity,
  Layers, Grid3X3, Target, ChevronDown, ChevronRight, ShieldAlert,
  Search, X, FileText, Zap, Eye, GitBranch, CheckCircle, XCircle,
  ArrowRight, Lightbulb, TrendingUp, HelpCircle, Wrench
} from 'lucide-react';
import { mockTraces, mockModels, mockGates, mockCoverage } from '../data/index';
import { IncidentTrace, ModelConfig } from '../types';
import ModelComparisonStrip from './ModelComparisonStrip';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

// Extracted granular subcomponents
import { ConfusionMatricesPanel, ZoneTimeHeatmapPanel, ScenarioBarChartPanel } from './FailureAnalysis';
import { VerdictBanner, GateChecklist, DataCoverageSidebar } from './DeploymentGates';
import { EvidenceFilterBar, EvidenceTable } from './TraceEvidence';

/* ═══════════════════════════════════════════════════════════
   INLINE STYLE HELPERS
   ═══════════════════════════════════════════════════════════ */

const calloutStyles = {
  tip: {
    background: 'rgba(16,185,129,0.06)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderLeft: '3px solid var(--color-pass)',
  },
  warn: {
    background: 'rgba(245,158,11,0.06)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderLeft: '3px solid var(--color-warn)',
  },
  danger: {
    background: 'rgba(239,68,68,0.06)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderLeft: '3px solid var(--color-fail)',
  },
  info: {
    background: 'var(--accent-glow)',
    border: '1px solid rgba(139,92,246,0.15)',
    borderLeft: '3px solid var(--accent)',
  },
} as const;

function Callout({ type, children }: { type: keyof typeof calloutStyles; children: React.ReactNode }) {
  const iconMap = { tip: CheckCircle, warn: AlertTriangle, danger: XCircle, info: Lightbulb };
  const colorMap = { tip: 'var(--color-pass)', warn: 'var(--color-warn)', danger: 'var(--color-fail)', info: 'var(--accent)' };
  const Icon = iconMap[type];
  return (
    <div style={{ ...calloutStyles[type], borderRadius: 'var(--radius-md)', padding: '12px 16px', marginTop: 12 }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
        <Icon size={14} color={colorMap[type]} />
        <span className="text-xs font-semibold" style={{ color: colorMap[type], textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {type === 'tip' ? 'Tip' : type === 'warn' ? 'Watch out' : type === 'danger' ? 'Critical' : 'Note'}
        </span>
      </div>
      <div className="text-sm text-secondary" style={{ lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DOC SECTION WRAPPER
   ═══════════════════════════════════════════════════════════ */

interface DocRow {
  label: string;
  content: string;
}

interface DocSectionProps {
  number: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode; // the live snapshot
  rows: DocRow[];
  defaultOpen?: boolean;
  guidance?: React.ReactNode;
}

function DocSection({ number, title, icon, children, rows, defaultOpen = true, guidance }: DocSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={`docs-section-${number}`} style={{ marginBottom: 32 }}>
      {/* Header */}
      <div
        className="flex items-center gap-3"
        style={{ marginBottom: 16, cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        <span style={{
          width: 28, height: 28, borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-glow)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>
          {number}
        </span>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="section-title" style={{ margin: 0 }}>{title}</h2>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {open ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
        </div>
      </div>

      {open && (
        <>
          {/* Live Snapshot */}
          <div style={{
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: 20,
            marginBottom: 16,
            background: 'var(--bg-base)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 8, right: 12,
              fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--text-muted)',
              background: 'var(--bg-surface)', padding: '2px 8px',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)',
            }}>
              Live Preview
            </div>
            {children}
          </div>

          {/* Documentation Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td style={{
                      paddingLeft: 16, width: 160, fontWeight: 600,
                      fontSize: 12, color: 'var(--text-secondary)',
                      verticalAlign: 'top', whiteSpace: 'nowrap',
                    }}>
                      {row.label}
                    </td>
                    <td style={{
                      fontSize: 12, lineHeight: 1.7,
                      color: 'var(--text-primary)',
                      whiteSpace: 'normal',
                    }}>
                      {row.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Guidance callouts */}
          {guidance && <div style={{ marginTop: 12 }}>{guidance}</div>}
        </>
      )}
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   TRACE DETAIL SUBCOMPONENTS
   ═══════════════════════════════════════════════════════════ */

function TraceDetailHeader({ trace }: { trace: IncidentTrace }) {
  return (
    <div className="detail-header" style={{ position: 'static', borderBottom: 'none' }}>
      <div>
        <div className="font-mono font-bold" style={{ fontSize: 15 }}>{trace.trace_id}</div>
        <div className="text-xs text-secondary" style={{ marginTop: 2 }}>
          {trace.camera_id} · {trace.zone_type} · {trace.time_band}
        </div>
      </div>
      <button
        style={{
          background: 'var(--bg-hover)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)', padding: '6px', cursor: 'pointer',
          color: 'var(--text-secondary)', display: 'flex',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

function TraceContextAndTriage({ trace }: { trace: IncidentTrace }) {
  return (
    <div className="flex-col gap-4" style={{ background: 'var(--bg-elevated)', padding: 16, borderRadius: 8, border: '1px solid var(--border-strong)' }}>
      {/* Context badges */}
      <div className="flex gap-2 flex-wrap">
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

      <div style={{ height: 1, background: 'var(--border-subtle)' }} />

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
  );
}

function TracePipelineExecution({ trace }: { trace: IncidentTrace }) {
  const totalLatency = trace.spans.reduce((acc, s) => acc + s.duration_ms, 0);
  const maxSpanEnd = Math.max(...trace.spans.map(s => s.start_time_ms + s.duration_ms));

  return (
    <div style={{ background: 'var(--bg-elevated)', padding: 16, borderRadius: 8, border: '1px solid var(--border-strong)' }}>
      <div className="card-title">Pipeline Execution · {totalLatency}ms</div>
      <div className="flex-col gap-1">
        {trace.spans.map(span => {
          const widthPct = Math.max(8, (span.duration_ms / maxSpanEnd) * 100);
          const leftPct = (span.start_time_ms / maxSpanEnd) * 100;
          return (
            <div key={span.id} style={{ position: 'relative', height: 28 }}>
              <div
                className="span-bar"
                style={{ position: 'absolute', left: `${leftPct}%`, width: `${widthPct}%` }}
              >
                {span.name} · {span.duration_ms}ms
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TraceScoreTimeline({ trace }: { trace: IncidentTrace }) {
  const timelineData = trace.score_raw.map((r, i) => ({
    frame: i,
    raw: r,
    smooth: trace.score_smooth[i],
  }));

  return (
    <div style={{ background: 'var(--bg-elevated)', padding: 16, borderRadius: 8, border: '1px solid var(--border-strong)' }}>
      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Activity size={14} color="var(--text-secondary)" /> Score Timeline
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
      <div className="flex justify-between text-xs" style={{ marginTop: 8 }}>
        <span className="text-muted">Threshold: <span className="font-mono" style={{ color: 'var(--color-fail)' }}>{trace.threshold.toFixed(2)}</span></span>
        <span className="text-muted">Peak: <span className="font-mono" style={{ color: 'var(--accent)' }}>{trace.anomaly_score.toFixed(2)}</span></span>
      </div>
    </div>
  );
}

function TraceModelScores({ trace, models }: { trace: IncidentTrace; models: typeof mockModels }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', padding: 16, borderRadius: 8, border: '1px solid var(--border-strong)' }}>
      <div className="card-title">Model Scores for this Trace</div>
      <div className="flex-col gap-3">
        {models.map(model => {
          const detected = trace.model_detections[model.run_id] ?? false;
          const confidence = trace.metrics[model.run_id]?.confidence ?? 0;
          return (
            <div key={model.run_id}>
              <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
                <div className="flex items-center gap-2">
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: model.color, display: 'inline-block' }} />
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
  );
}

/* ═══════════════════════════════════════════════════════════
   WORKFLOW STEP CARD
   ═══════════════════════════════════════════════════════════ */

function WorkflowStep({ step, title, description, icon, accent }: {
  step: number; title: string; description: string; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="card" style={{ padding: '16px 20px', flex: '1 1 280px', minWidth: 240, borderTop: `2px solid ${accent}` }}>
      <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
        <span style={{
          width: 26, height: 26, borderRadius: '50%', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 12,
          fontWeight: 700, background: accent, color: '#fff', flexShrink: 0,
        }}>
          {step}
        </span>
        <div style={{ color: accent, display: 'flex' }}>{icon}</div>
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="text-xs text-secondary" style={{ lineHeight: 1.65 }}>{description}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MODEL CARD FOR ABLATION STUDY
   ═══════════════════════════════════════════════════════════ */

function ModelCard({ model, technique, rationale }: {
  model: ModelConfig; technique: string; rationale: string;
}) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 'var(--radius-md)',
      background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      flex: '1 1 170px', minWidth: 160,
    }}>
      <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: model.color, flexShrink: 0 }} />
        <span className="font-semibold text-sm">{model.short_name}</span>
        {model.is_candidate && (
          <span className="badge badge-pass" style={{ fontSize: 8, padding: '1px 5px' }}>candidate</span>
        )}
      </div>
      <div className="text-xs font-semibold" style={{ color: model.color, marginBottom: 4 }}>{technique}</div>
      <div className="text-xs text-muted" style={{ lineHeight: 1.55 }}>{rationale}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TROUBLESHOOTING ITEM
   ═══════════════════════════════════════════════════════════ */

function TroubleshootItem({ title, symptom, steps, actions }: {
  title: string; symptom: string; steps: string[]; actions: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div
        className="flex items-center gap-3"
        style={{ padding: '14px 20px', cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        <Wrench size={14} color="var(--color-warn)" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs text-muted" style={{ marginTop: 2 }}>{symptom}</div>
        </div>
        {open ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
      </div>
      {open && (
        <div style={{ padding: '0 20px 16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ marginTop: 12 }}>
            <div className="text-xs font-semibold" style={{ color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Diagnostic Steps
            </div>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {steps.map((s, i) => (
                <li key={i} className="text-xs text-secondary" style={{ lineHeight: 1.7, marginBottom: 2 }}>{s}</li>
              ))}
            </ol>
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="text-xs font-semibold" style={{ color: 'var(--color-pass)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recommended Actions
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {actions.map((a, i) => (
                <li key={i} className="text-xs text-secondary" style={{ lineHeight: 1.7, marginBottom: 2 }}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function EvalDocs() {
  const [selectedModels] = useState(mockModels.map(m => m.run_id));
  const visibleModels = mockModels.filter(m => selectedModels.includes(m.run_id));
  const sampleTrace = mockTraces.find(t => t.tags.includes('true_positive')) || mockTraces[0];
  const candidateId = selectedModels[selectedModels.length - 1] || selectedModels[0];
  const candidateModel = mockModels.find(m => m.run_id === candidateId);

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: 32 }}>

      {/* ══════════════════════════════════════════════════════
          INTRODUCTION — GETTING STARTED
          ══════════════════════════════════════════════════════ */}
      <section id="docs-getting-started">
        {/* Hero banner */}
        <div style={{
          padding: '24px 28px', borderRadius: 'var(--radius-md)',
          background: 'var(--accent-glow)', border: '1px solid rgba(139,92,246,0.15)',
          marginBottom: 20,
        }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
            <BookOpen size={20} color="var(--accent)" />
            <span className="font-semibold" style={{ fontSize: 17 }}>VAD Model Evaluation — Diagnostic Guide</span>
          </div>
          <div className="text-sm text-secondary" style={{ lineHeight: 1.8, maxWidth: 800 }}>
            This dashboard evaluates <strong>5 model iterations</strong> of a CCTV anomaly detection pipeline.
            Each model adds one architectural improvement to the previous version, creating an <strong>ablation study</strong> that
            isolates the contribution of each technique. The goal: determine which candidate model (if any) is safe to deploy
            to production — and if not, diagnose exactly what's going wrong.
          </div>
          <div className="text-sm text-secondary" style={{ lineHeight: 1.8, marginTop: 8 }}>
            Every panel on this page shows a <strong>live preview</strong> using real mock data. The previews are interactive —
            they behave exactly as they do on the Evaluation page. Below each preview is a reference table explaining what
            the panel shows, why it matters, and what decisions it supports.
          </div>
        </div>

        {/* Why 5 Models — Ablation Study */}
        <div style={{ marginBottom: 20 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
            <GitBranch size={16} color="var(--accent)" />
            <h3 className="section-title" style={{ margin: 0, fontSize: 14 }}>The 5-Model Ablation Study</h3>
          </div>
          <div className="text-sm text-secondary" style={{ lineHeight: 1.7, marginBottom: 14, maxWidth: 780 }}>
            Rather than comparing a single new model against a single old model, this dashboard runs an ablation study.
            Each iteration adds exactly one technique so you can see what each improvement contributes in isolation.
            If A4 scores well but A2 doesn't, you know temporal smoothing was the key ingredient, not the memory bank.
          </div>
          <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
            <ModelCard
              model={mockModels[0]}
              technique="No changes"
              rationale="The control. Frame-level anomaly detection with no temporal reasoning. Every other model is measured against this."
            />
            <ModelCard
              model={mockModels[1]}
              technique="Memory-guided attention"
              rationale="Adds a memory bank so the model can compare the current frame against learned 'normal' prototypes."
            />
            <ModelCard
              model={mockModels[2]}
              technique="Temporal smoothing"
              rationale="Adds a 1D temporal convolution to smooth noisy per-frame scores, reducing jitter and false spikes."
            />
            <ModelCard
              model={mockModels[3]}
              technique="Event persistence"
              rationale="Adds hysteresis thresholding — once an anomaly starts, it requires sustained normalcy to end the alert."
            />
            <ModelCard
              model={mockModels[4]}
              technique="All improvements combined"
              rationale="The deployment candidate. Combines memory, smoothing, and persistence into a single model."
            />
          </div>
          <Callout type="info">
            If A4 (full stack) underperforms A3 on a specific scenario, that means the combined architecture
            has a regression — possibly because smoothing dampens signals that persistence relies on. The ablation design
            makes this kind of interaction visible.
          </Callout>
        </div>

        {/* Workflow overview */}
        <div style={{ marginBottom: 8 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
            <Eye size={16} color="var(--accent)" />
            <h3 className="section-title" style={{ margin: 0, fontSize: 14 }}>How to Use This Dashboard</h3>
          </div>
          <div className="text-sm text-secondary" style={{ lineHeight: 1.7, marginBottom: 4 }}>
            Follow the diagnostic workflow: <strong>Compare</strong> models to pick the best →
            <strong> Diagnose</strong> where it fails → <strong>Decide</strong> if it can ship →
            <strong> Drill down</strong> into individual incidents for root-cause analysis.
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6-STEP DIAGNOSTIC WORKFLOW
          ══════════════════════════════════════════════════════ */}
      <section id="docs-workflow">
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <Zap size={18} color="var(--accent)" />
          <h2 className="section-title" style={{ margin: 0 }}>6-Step Diagnostic Workflow</h2>
        </div>
        <div className="text-sm text-secondary" style={{ lineHeight: 1.7, marginBottom: 16, maxWidth: 780 }}>
          Each section below maps to one step. Work through them in order. If you find the answer early, stop — not every
          evaluation needs all 6 steps. The step numbers here match the section numbers below.
        </div>
        <div className="flex gap-3" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
          <WorkflowStep step={1} title="Model Comparison" description="Compare all 5 models on 7 metrics. Identify the strongest candidate and check if improvements are statistically meaningful." icon={<BarChart3 size={16} />} accent="var(--accent)" />
          <WorkflowStep step={2} title="Error Analysis" description="Examine confusion matrices, zone×time heatmaps, and scenario breakdowns to understand WHERE and HOW the model fails." icon={<AlertTriangle size={16} />} accent="var(--color-warn)" />
          <WorkflowStep step={3} title="Deployment Gates" description="Check the pass/fail checklist. Does the candidate meet every non-negotiable requirement from each stakeholder track?" icon={<ShieldAlert size={16} />} accent="var(--color-fail)" />
          <WorkflowStep step={4} title="Data Quality" description="Verify the evaluation data itself. Low approval rates mean your metrics may be built on unreliable ground truth." icon={<Layers size={16} />} accent="var(--color-pass)" />
          <WorkflowStep step={5} title="Trace Evidence" description="Drill into the raw evidence table. Filter by zone, scenario, or error type to find the specific traces causing failures." icon={<Database size={16} />} accent="#06b6d4" />
          <WorkflowStep step={6} title="Trace Detail" description="Inspect individual incidents: score timelines, pipeline latency, per-model confidence, and operator triage outcomes." icon={<Activity size={16} />} accent="#f59e0b" />
        </div>
        <Callout type="tip">
          Most evaluations are resolved by Step 3. If the candidate passes all gates, you're done.
          Steps 5–6 are for diagnosing <em>why</em> a gate failed or investigating edge cases before sign-off.
        </Callout>
      </section>

      {/* ── Section 1: Model Comparison Strip ── */}
      <DocSection
        number={1}
        title="Model Comparison Strip"
        icon={<BarChart3 size={16} color="var(--accent)" />}
        rows={[
          { label: 'What it shows', content: 'A table of 5 model iterations (Baseline → A4), each with 7 metrics side-by-side. The best value per column is highlighted green. Each row also shows a delta vs. the Baseline.' },
          { label: 'Why it exists', content: 'To answer "Which model is best, and by how much?" in one glance. Model selection has consequences — shipping the wrong model means missed detections or nuisance alerts.' },
          { label: 'How to read it', content: 'Scan columns left-to-right. Green-highlighted cells are the winner for that metric. The small ±delta numbers show change from Baseline. If deltas are small (<2%), the improvement may not be statistically significant — check your confidence intervals. Toggle models on/off with the pills at the top to focus your comparison.' },
          { label: 'PR-AUC', content: 'Area under the Precision–Recall curve. Higher is better. Measures overall ranking quality — can the model separate real anomalies from noise? This is threshold-independent, so it tells you about the model\'s potential before you pick a decision threshold.' },
          { label: 'F1', content: 'Harmonic mean of precision and recall. A single number that balances "don\'t miss real events" against "don\'t cry wolf". Most useful as a quick health check.' },
          { label: 'tIoU', content: 'Temporal Intersection-over-Union. Measures how well the detected event window overlaps with the real event. A model can have high F1 but poor tIoU if its timing is off — it fires too early, too late, or holds the alert too long.' },
          { label: 'Precision', content: 'Of everything the model flagged, what percentage was actually a real anomaly? Low precision = too many false alarms = operator fatigue.' },
          { label: 'Recall', content: 'Of all real anomalies, what percentage did the model catch? Low recall = missed events = security risk.' },
          { label: 'FAR/100h', content: 'False Alarm Rate per 100 hours of footage. Lower is better. This is what operators feel — each false alarm wastes review time and erodes trust.' },
          { label: 'Confirm Rate', content: 'What percentage of alerts were confirmed by operators as genuine? This is the field-truth metric — it reflects real operational trust independent of your ground-truth labels.' },
          { label: 'Next step', content: 'If one model clearly dominates: proceed to Section 2 to check WHERE it still fails. If models are close: toggle off weaker ones and compare just the top 2. If no model improves on Baseline: the techniques aren\'t working — revisit architecture.' },
        ]}
        guidance={
          <>
            <Callout type="warn">
              Don't pick a model on F1 alone. A model with 0.87 F1 but 14.2 FAR/100h will overwhelm operators.
              Always cross-check F1 against FAR and Confirm Rate — they represent the operator's lived experience.
            </Callout>
            <Callout type="tip">
              If Confirm Rate is low but F1 is high, the model's ground truth labels may disagree with operator judgement.
              This signals a labelling problem, not a model problem. See the Troubleshooting section.
            </Callout>
          </>
        }
      >
        <ModelComparisonStrip
          models={mockModels}
          selectedModels={selectedModels}
          onToggleModel={() => {}}
        />
      </DocSection>

      {/* ── Section 2: Confusion Matrices ── */}
      <DocSection
        number={2}
        title="Error Analysis — Confusion Matrices"
        icon={<AlertTriangle size={16} color="var(--color-warn)" />}
        rows={[
          { label: 'What it shows', content: 'A 2×2 grid per model: True Positives (TP), False Positives (FP), False Negatives (FN), True Negatives (TN). Colour-coded: green = TP, red = FP, amber = FN, grey = TN.' },
          { label: 'Why it exists', content: 'F1 and precision are ratios — they hide the raw counts. A confusion matrix shows exactly how many events were caught, missed, or incorrectly flagged. You need the raw numbers to judge whether a model is failing in a way you can live with.' },
          { label: 'How to read it', content: 'Top-left (TP) = correctly detected anomalies. Top-right (FN) = missed anomalies. Bottom-left (FP) = false alarms. Bottom-right (TN) = correctly ignored. Compare matrices across models: watch for FN trending up (missed events) or FP not dropping between iterations.' },
          { label: 'Key patterns', content: 'High FP + Low FN → cautious model, catches everything but cries wolf. High FN + Low FP → conservative model, misses real events. Both high → model is confused. Ideal: TP and TN dominate, FP and FN are both small.' },
          { label: 'What to do', content: 'If FP is your problem → increase the detection threshold, add temporal smoothing, or improve negative mining in training. If FN is your problem → lower the threshold, augment with hard examples, or check the training data for label gaps.' },
          { label: 'Next step', content: 'Once you know the dominant error type (FP or FN), go to Section 3 to find WHERE those errors cluster (which zones and time bands).' },
        ]}
        guidance={
          <Callout type="info">
            Compare the candidate (A4) matrix against A3 and Baseline side-by-side. If A4's FP dropped but FN
            rose, the full-stack model traded missed detections for fewer false alarms. Whether that trade-off is
            acceptable depends on your site's risk profile.
          </Callout>
        }
      >
        <ConfusionMatricesPanel traces={mockTraces} visibleModels={visibleModels} />
      </DocSection>

      {/* ── Section 3: Zone × Time Heatmap ── */}
      <DocSection
        number={3}
        title="Error Analysis — Zone × Time Heatmap"
        icon={<Grid3X3 size={16} color="var(--color-warn)" />}
        rows={[
          { label: 'What it shows', content: 'A heatmap of F1 score broken down by zone (Atrium, Corridor, Parking, etc.) and time band (Morning Rush, Midday, etc.) for the candidate model.' },
          { label: 'Why it exists', content: 'Aggregate metrics mask blind spots. A model with 87% F1 overall might score 40% in "Loading Dock × Late Night". This panel exposes those pockets of failure so you know exactly where the model will break in production.' },
          { label: 'Heatmap colours', content: 'Green (≥85): strong performance, likely safe to deploy in this slice. Amber (70–84): acceptable but monitor closely, consider extra review. Red (<70): problem area — investigate specific traces. Grey dash (—): no evaluation data for that combination, which is itself a risk.' },
          { label: 'What to do if a cell is red', content: 'Filter the Evidence Table (Section 8) to that zone + time band. Examine the failing traces to understand why. Common causes: insufficient training data for that environment, lighting changes at night, or unusual traffic patterns (e.g., loading dock activity at 2am).' },
          { label: 'What to do if a cell is grey', content: 'Grey means no test data exists for that combination. You cannot claim the model works there. Either collect more evaluation data or mark that zone×time as out-of-scope in your deployment plan.' },
          { label: 'Next step', content: 'If the heatmap is mostly green with one or two red cells, those are containable risks — proceed to Section 4 (Scenario F1) to check if the failure is scenario-specific. If multiple cells are red, the model has systemic issues.' },
        ]}
        guidance={
          <Callout type="danger">
            A heatmap full of green doesn't mean the model is perfect — it means it's performing well on the data you tested.
            If key zone×time combinations are grey (no data), your evaluation has blind spots. Treat grey the same as red
            until you have evidence otherwise.
          </Callout>
        }
      >
        {candidateModel ? (
          <ZoneTimeHeatmapPanel traces={mockTraces} candidateModel={candidateModel} candidateId={candidateId} />
        ) : <div />}
      </DocSection>

      {/* ── Section 4: Scenario F1 Bar Chart ── */}
      <DocSection
        number={4}
        title="Error Analysis — Scenario F1 Chart"
        icon={<BarChart3 size={16} color="var(--color-warn)" />}
        rows={[
          { label: 'What it shows', content: 'A horizontal bar chart of F1 per scenario (loitering, tailgating, abandoned object, etc.) for each visible model. Bars are grouped by scenario so you can directly compare models.' },
          { label: 'Why it exists', content: 'Different anomaly types challenge different parts of the model. A model might ace "loitering" detection but struggle with "tailgating" because tailgating requires understanding spatial relationships between two people, not just individual behaviour.' },
          { label: 'How to read it', content: 'Within each scenario group, compare bar lengths across models. If A4 beats Baseline on "loitering" but not "tailgating", that tells you the full-stack improvement is scenario-specific — the memory bank may help with loitering (recognising repeated presence) but not with tailgating (a brief one-time event).' },
          { label: 'What to do', content: 'If a scenario has universally low F1 across all models, the problem is likely data quality or label ambiguity for that scenario type — not model architecture. If only one model scores low on a scenario, examine what that model iteration changed and whether the change hurts that specific pattern.' },
          { label: 'Next step', content: 'Once you understand the error profile (confusion matrix + heatmap + scenario chart), proceed to Section 5 to check whether the candidate model passes all deployment gates.' },
        ]}
        guidance={
          <Callout type="tip">
            Scenarios with very few traces (check the Evidence Table for counts) will have noisy F1 scores.
            A bar showing 100% or 0% with only 3 traces is unreliable. Always cross-check against sample size.
          </Callout>
        }
      >
        <ScenarioBarChartPanel traces={mockTraces} visibleModels={visibleModels} />
      </DocSection>

      {/* ── Section 5: Deployment Verdict Banner ── */}
      <DocSection
        number={5}
        title="Deployment Gates — Verdict"
        icon={<ShieldAlert size={16} color="var(--color-fail)" />}
        rows={[
          { label: 'What it shows', content: 'A ship/no-ship decision banner. Green = READY TO SHIP (all gates pass). Amber = CONDITIONAL (warnings require human review). Red = BLOCKED (one or more gates failing).' },
          { label: 'Why it exists', content: 'Provides an immediate, unambiguous answer to "can we deploy this model?" without needing to interpret charts. This is the executive summary of the evaluation.' },
          { label: 'Verdict logic', content: 'If any gate is red → BLOCKED. If all pass but some are amber → CONDITIONAL (needs stakeholder review and sign-off). All green → READY TO SHIP.' },
          { label: 'What to do if BLOCKED', content: 'Do not deploy. Check Section 6 (Gate Checklist) to identify which specific gates are failing. Then use Sections 2–4 to diagnose why those metrics are below threshold.' },
          { label: 'What to do if CONDITIONAL', content: 'The model passes hard requirements but has warnings. Escalate each warning to its track owner (the reviewer listed in the gate checklist). Alternatively, click on the gate row to review and approve/reject the warning directly in this dashboard.' },
          { label: 'Next step', content: 'Always check the Gate Checklist (Section 6) even if the verdict is green — the checklist shows HOW CLOSE you are to thresholds, which predicts future risk.' },
        ]}
      >
        <VerdictBanner gates={mockGates} />
      </DocSection>

      {/* ── Section 6: Deployment Gate Checklist ── */}
      <DocSection
        number={6}
        title="Deployment Gates — Checklist"
        icon={<Target size={16} color="var(--color-pass)" />}
        rows={[
          { label: 'What it shows', content: 'A checklist of 5 gates with pass/fail/warning status, measured values, thresholds, and reviewer sign-offs. Each gate represents a non-negotiable requirement from a different stakeholder.' },
          { label: 'Gate anatomy', content: 'Each row shows: gate name, which track it belongs to (Track A/B/Holdout/Infra/Ops), the requirement in plain language, the measured value (colour-coded), the threshold, and the reviewer\'s sign-off status (pending / approved / rejected).' },
          { label: 'Track owners', content: 'Track A = localisation accuracy (tIoU on high-density zones). Track B = operator burden (FAR). Holdout = generalization (no regression on out-of-distribution data). Infra = latency SLA. Ops = operator confirmation rate. Each track has a designated reviewer.' },
          { label: 'What to do if a gate fails', content: 'Identify which track the gate belongs to. Use the corresponding analysis panel: Track A → Zone×Time Heatmap (Section 3). Track B → Confusion Matrices (Section 2). Holdout → Scenario Chart (Section 4). Infra → Pipeline Execution (Section 13). Ops → Trace Detail context (Section 11).' },
          { label: 'What to do if pending', content: 'A "pending" sign-off means the reviewer hasn\'t yet approved or rejected the gate. Click the gate row to open the review panel and sign off directly, or escalate by sharing the evidence string shown in the gate row.' },
          { label: 'Next step', content: 'If all gates pass, the evaluation is complete — document your findings and deploy. If gates are failing, use Section 7 (Coverage) to verify data quality before investigating further.' },
        ]}
        guidance={
          <Callout type="warn">
            A gate that passes with its value barely above threshold (e.g., tIoU = 0.76 vs threshold 0.75) is a
            fragile pass. Small changes in production data distribution could push it below threshold. Flag these
            as risks in your deployment report even though they pass.
          </Callout>
        }
      >
        <GateChecklist gates={mockGates} />
      </DocSection>

      {/* ── Section 7: Data Coverage Sidebar ── */}
      <DocSection
        number={7}
        title="Deployment Gates — Data Coverage"
        icon={<Layers size={16} color="var(--accent)" />}
        rows={[
          { label: 'What it shows', content: 'Four stacked bars: Total traces, Labelled (has ground-truth), Reviewed (checked by a second person), Approved (final sign-off). Plus an overall Approval Rate percentage.' },
          { label: 'Why it exists', content: 'To measure the trustworthiness of the evaluation data itself. All the metrics above are only as reliable as the labels they\'re computed from. If only 60% of traces are approved, 40% of your evaluation is built on unvetted data.' },
          { label: 'What to do if approval rate is low', content: 'Low approval (<70%) means your evaluation is unreliable. Before making any ship/no-ship decision, get more traces reviewed and approved. Focus review effort on the traces that matter most: those in failing zones/time bands from the heatmap.' },
          { label: 'What to do if labelled count is low', content: 'If many traces are unlabelled, the confusion matrix and F1 scores are computed on a subset and may not represent the full distribution. Prioritise labelling for underrepresented zone×time combinations.' },
          { label: 'Next step', content: 'If coverage is adequate (>70% approval), proceed to the Evidence Table (Section 8) to drill into specific traces. If coverage is low, pause the evaluation and complete the labelling pipeline first.' },
        ]}
        guidance={
          <Callout type="danger">
            Never ship a model based on an evaluation with less than 70% approval rate. The risk of making a
            decision on unreliable ground truth outweighs the cost of delaying deployment to complete review.
          </Callout>
        }
      >
        <DataCoverageSidebar coverage={mockCoverage} />
      </DocSection>

      {/* ── Section 8: Anomaly Evidence Filter ── */}
      <DocSection
        number={8}
        title="Trace Evidence — Filters"
        icon={<Search size={16} color="var(--text-primary)" />}
        rows={[
          { label: 'What it shows', content: 'A search box and filter pills for ground truth (actionable/benign/unclear), zones (Atrium, Corridor, etc.), and tags (TP/FP/FN/TN).' },
          { label: 'Why it exists', content: 'To slice and dice the trace dataset and find the needle in the haystack. When a gate fails or a heatmap cell is red, you come here to narrow down to the specific traces causing the problem.' },
          { label: 'How to use it', content: 'Start by clicking a tag filter (e.g., "false positive") to see only FP traces. Then add a zone filter to narrow to the problem area from the heatmap. Use the search box to find specific trace IDs or camera IDs if you have a known incident to investigate.' },
          { label: 'Filter combinations', content: 'Filters are AND-combined: selecting "false positive" + "Parking" shows only FP traces in the Parking zone. Click an active filter again to deselect it. The evidence table below updates immediately.' },
          { label: 'Next step', content: 'Once you\'ve filtered to the traces you care about, scan the Evidence Table (Section 9) and click a row to open Trace Detail (Sections 10–14).' },
        ]}
        guidance={
          <Callout type="tip">
            Common investigation patterns: Filter by "false_negative" to find missed detections. Filter by
            "false_positive" + a specific zone to investigate nuisance alerts in a problem area. Search by camera
            ID to check if a specific camera is systematically causing issues.
          </Callout>
        }
      >
        <EvidenceFilterBar
          traces={mockTraces}
          search="" setSearch={() => {}}
          filterGT={null} setFilterGT={() => {}}
          filterZone={null} setFilterZone={() => {}}
          filterTag={null} setFilterTag={() => {}}
        />
      </DocSection>

      {/* ── Section 9: Anomaly Evidence Table ── */}
      <DocSection
        number={9}
        title="Trace Evidence — Data Table"
        icon={<Database size={16} color="var(--text-primary)" />}
        rows={[
          { label: 'What it shows', content: 'A sortable table of traces. Each row: trace ID, zone, anomaly score, ground truth, scenario, per-model detection (✓/✗), and tags (TP/FP/FN/TN).' },
          { label: 'Why it exists', content: 'Aggregate numbers don\'t explain why a model fails. This table lets you drill into individual events to find patterns in the raw data.' },
          { label: 'Per-model columns', content: 'Each selected model gets a column showing ✓ (detected) or ✗ (missed). This instantly reveals model disagreements — if A4 catches a trace but Baseline doesn\'t, that\'s the value of the A4 improvements. If A4 misses a trace that A3 caught, that\'s a regression to investigate.' },
          { label: 'What to look for', content: 'Rows where models disagree are the most diagnostic. A trace where A4=✓ but A1/A2/A3=✗ shows the full-stack model solving a problem that individual improvements couldn\'t. A trace where A4=✗ but A3=✓ shows the full-stack model regressing — possibly because combined techniques interfere with each other.' },
          { label: 'What to do', content: 'Click any row to open the Trace Detail panel. Start with the worst failures: sort by score descending and filter to "false_positive" to find high-confidence false alarms — these are the most damaging to operator trust.' },
          { label: 'Next step', content: 'Clicking a row opens Sections 10–14 (Trace Detail) in a side panel. This is where root-cause analysis happens.' },
        ]}
      >
        <EvidenceTable
          filtered={mockTraces.slice(0, 3)}
          visibleModels={visibleModels}
          onSelectTrace={() => {}}
          selectedTraceId={null}
        />
      </DocSection>

      {/* ── Section 10: Trace Detail Header ── */}
      <DocSection
        number={10}
        title="Trace Detail — Header"
        icon={<FileText size={16} color="var(--accent)" />}
        rows={[
          { label: 'What it shows', content: 'The unique trace ID (e.g., TRC-1042), camera ID, zone type, and time band of the incident.' },
          { label: 'Why it exists', content: 'To uniquely identify the event and provide immediate spatial-temporal context. The camera ID tells you which physical camera captured the event; zone and time band tell you the environmental conditions.' },
          { label: 'How to use it', content: 'Use the trace ID to cross-reference with external systems (SIEM, video management). The camera ID helps you determine if a specific camera has hardware issues (dirty lens, bad angle) that affect model performance.' },
          { label: 'Close button', content: 'The X button dismisses the detail side-panel and returns focus to the evidence table.' },
        ]}
      >
        <TraceDetailHeader trace={sampleTrace} />
      </DocSection>

      {/* ── Section 11: Trace Context & Triage ── */}
      <DocSection
        number={11}
        title="Trace Detail — Context & Triage"
        icon={<AlertTriangle size={16} color="var(--accent)" />}
        rows={[
          { label: 'What it shows', content: 'Context badges (ground truth, scenario, day type, priority, TP/FP/FN tags) and Operator Triage details (action taken, review time, priority, annotation status).' },
          { label: 'Why it exists', content: 'To ground the model\'s output in operational reality. The model says "anomaly" — but what did the human operator actually do? Did they confirm it, dismiss it, or ignore it entirely?' },
          { label: 'Operator action', content: 'Confirmed = operator verified a real anomaly. Dismissed = operator reviewed and rejected as false alarm. Ignored = operator never looked at it (alert fatigue). Escalated = operator passed it up the chain. "Ignored" is the most dangerous — it means the alert system is losing the operator\'s trust.' },
          { label: 'Review time', content: 'How many seconds the operator spent reviewing this alert. Long review times (>60s) on true positives may indicate the alert wasn\'t clear enough. Short review times (<5s) on dismissed alerts may indicate automatic dismissal habits.' },
          { label: 'What to do', content: 'If you see many "ignored" actions on true positives, operators are overwhelmed by false alarms — reducing FAR is the priority. If review times are consistently long, the alert presentation needs improvement (better thumbnails, context, or pre-classification).' },
        ]}
        guidance={
          <Callout type="info">
            The gap between ground truth labels and operator actions is one of the most valuable signals in this
            dashboard. If ground truth says "actionable" but the operator dismissed it, either the label is wrong
            or the operator made an error. Both are worth investigating.
          </Callout>
        }
      >
        <TraceContextAndTriage trace={sampleTrace} />
      </DocSection>

      {/* ── Section 12: Trace Score Timeline ── */}
      <DocSection
        number={12}
        title="Trace Detail — Score Timeline"
        icon={<Activity size={16} color="var(--accent)" />}
        rows={[
          { label: 'What it shows', content: 'A time series of the raw (grey) and smoothed (blue) anomaly scores for the duration of the trace, relative to the decision threshold (red dashed line).' },
          { label: 'Why it exists', content: 'To understand the temporal dynamics of the model\'s confidence. Was it a sharp spike (momentary event) or a sustained anomaly (ongoing situation)? This helps diagnose false positives and missed detections.' },
          { label: 'Raw vs smoothed', content: 'The grey raw score shows the per-frame output — it\'s noisy. The blue smoothed line applies temporal aggregation. If the smoothed line crosses the red threshold, an alert is triggered. The gap between raw and smooth shows how much the temporal smoothing is helping or hurting.' },
          { label: 'What to do if FP', content: 'If this trace is a false positive, examine the score timeline. Is it a single sharp spike above threshold? → The model was momentarily confused (noise). Did the smoothed line gradually climb above threshold? → The model consistently misinterpreted normal activity as anomalous — this is a harder problem to fix.' },
          { label: 'What to do if FN', content: 'If this trace is a false negative, look at the peak score relative to the threshold. If the peak is just below threshold, a small threshold adjustment might fix it without increasing FAR. If the peak is far below threshold, the model genuinely doesn\'t see the anomaly — this needs model changes, not threshold tuning.' },
          { label: 'Threshold marker', content: 'The dashed red line is the current decision threshold. Everything above it triggers an alert. The "Peak" value shown below the chart is the maximum smoothed score — if it\'s 0.58 and threshold is 0.60, you know you\'re 2 percentage points from detection.' },
        ]}
        guidance={
          <Callout type="warn">
            If many false negatives have peak scores clustered just below the threshold (within 5%), consider
            lowering the threshold slightly. But always check the impact on FAR first — a lower threshold will
            also increase false alarms.
          </Callout>
        }
      >
        <TraceScoreTimeline trace={sampleTrace} />
      </DocSection>

      {/* ── Section 13: Trace Pipeline Execution ── */}
      <DocSection
        number={13}
        title="Trace Detail — Pipeline Execution"
        icon={<Activity size={16} color="var(--accent)" />}
        rows={[
          { label: 'What it shows', content: 'A horizontal flame chart showing how long each processing stage took: Frame Decode → Object Detection → Feature Extraction → Temporal Model. Total latency is summed at the top.' },
          { label: 'Why it exists', content: 'To spot performance bottlenecks and measure end-to-end latency. If the Latency SLA gate (Section 6) is failing, this chart tells you exactly which pipeline stage is the culprit.' },
          { label: 'How to read it', content: 'Each bar\'s width is proportional to its duration. Longer bars = slower stages. The Temporal Model stage typically dominates because it runs the neural network. Frame Decode and Object Detection are pre-processing.' },
          { label: 'What to do if slow', content: 'If total latency exceeds the SLA: (1) Check if Temporal Model is >70% of total — consider model pruning or quantization. (2) Check if Object Detection is slow — may indicate too many objects in frame (crowded scenes). (3) Check Frame Decode — may indicate resolution/codec issues with the camera feed.' },
          { label: 'What to do if inconsistent', content: 'If latency varies wildly across traces, sort the Evidence Table by zone and check if certain cameras/zones consistently have higher latency. Hardware issues (network congestion, GPU thermal throttling) may be zone-correlated.' },
        ]}
      >
        <TracePipelineExecution trace={sampleTrace} />
      </DocSection>

      {/* ── Section 14: Trace Model Scores ── */}
      <DocSection
        number={14}
        title="Trace Detail — Model Scores"
        icon={<BarChart3 size={16} color="var(--accent)" />}
        rows={[
          { label: 'What it shows', content: 'A gauge bar per model showing the confidence score for this specific trace. The red vertical line marks the decision threshold. Models above threshold show "DETECTED"; those below show "SILENT".' },
          { label: 'Why it exists', content: 'To diagnose model-specific failures on a single event. This is the most granular diagnostic tool — it shows you exactly why one model caught an event and another didn\'t.' },
          { label: 'How to read it', content: 'Compare gauge positions relative to the red threshold line. A model with confidence 0.58 (just below 0.60 threshold) was close to detecting — a small change could flip the outcome. A model with confidence 0.12 genuinely doesn\'t see the anomaly.' },
          { label: 'Model disagreements', content: 'The most interesting pattern is when models disagree: A4 "DETECTED" but Baseline "SILENT" → A4\'s improvements worked. A3 "DETECTED" but A4 "SILENT" → the full-stack model has a regression. All models "SILENT" → either the anomaly is genuinely hard to detect or the ground truth label is questionable.' },
          { label: 'What to do', content: 'If scores cluster just below threshold across multiple models, a small threshold reduction might fix the problem globally. If only one model is far below, that model iteration broke something — compare its architecture change against the specific scenario to understand why.' },
          { label: 'Key decision', content: 'If all model scores are uniformly low for a confirmed anomaly, the event may be outside the model\'s training distribution. Collect more training examples of this scenario type.' },
        ]}
        guidance={
          <Callout type="tip">
            Use this panel to build intuition about the threshold. If you see many traces where the candidate's
            score is within ±0.05 of the threshold, the model is "threshold-sensitive" — small distribution shifts
            in production will cause unpredictable detection behaviour. Consider widening the margin.
          </Callout>
        }
      >
        <TraceModelScores trace={sampleTrace} models={mockModels} />
      </DocSection>

      {/* ══════════════════════════════════════════════════════
          TROUBLESHOOTING
          ══════════════════════════════════════════════════════ */}
      <section id="docs-troubleshooting" style={{ marginTop: 16 }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
          <HelpCircle size={18} color="var(--color-warn)" />
          <h2 className="section-title" style={{ margin: 0 }}>Troubleshooting Common Problems</h2>
        </div>
        <div className="text-sm text-secondary" style={{ lineHeight: 1.7, marginBottom: 16, maxWidth: 780 }}>
          These are the most frequent evaluation scenarios where the numbers don't add up or the verdict is
          surprising. Each includes diagnostic steps and recommended actions.
        </div>

        <div className="flex-col gap-3">
          <TroubleshootItem
            title="Model has high F1 but low Confirm Rate"
            symptom="F1 is 0.85+ but operators only confirm 60% of alerts"
            steps={[
              'Open the Evidence Table (Section 9) and filter to "false_positive" to see what operators are dismissing.',
              'Check the Trace Detail Context (Section 11) for those FP traces — look at operator_action and review_time.',
              'Compare ground_truth labels vs operator_action: if ground truth says "actionable" but operator says "dismissed", you may have a label quality problem.',
              'Check the Data Coverage panel (Section 7) — low approval rates amplify label disagreements.',
            ]}
            actions={[
              'Audit ground truth labels for the most-dismissed scenarios. If operators consistently disagree with labels, the labels are probably wrong.',
              'Re-calibrate what "actionable" means with your labelling team. Operator judgement should be the primary reference for confirm rate.',
              'Consider adding an "operator override" feedback loop to automatically update labels based on sustained operator patterns.',
            ]}
          />

          <TroubleshootItem
            title="One zone is always red in the heatmap"
            symptom="The same zone shows F1 < 70% across all time bands and all models"
            steps={[
              'Open the Zone × Time Heatmap (Section 3) and note which zone is consistently red.',
              'Filter the Evidence Table to that zone and check the dominant error type (FP or FN).',
              'Open several Trace Details from that zone and examine the Score Timeline (Section 12) — are scores consistently low (model can\'t see anomalies) or consistently high (model always thinks something is wrong)?',
              'Check the Pipeline Execution (Section 13) for traces in that zone — latency issues or dropped frames may affect detection quality.',
            ]}
            actions={[
              'If scores are always high (many FPs): The zone likely has persistent motion (e.g., a flag, tree, or rotating sign) that the model misinterprets. Add negative examples from this zone to the training set.',
              'If scores are always low (many FNs): The camera angle, lighting, or distance may make anomalies undetectable. Consider adjusting camera position or adding a zone-specific threshold.',
              'If the zone has very few traces: The low F1 may be statistical noise. Collect more evaluation data before concluding the model fails here.',
              'As a last resort, exclude the zone from automatic alerting and route it to periodic manual review instead.',
            ]}
          />

          <TroubleshootItem
            title="Gates pass but FAR is high"
            symptom="All 5 deployment gates show green/pass, but FAR/100h seems too high for comfortable operations"
            steps={[
              'Check the Gate Checklist (Section 6) — the FAR gate threshold may be set too leniently (e.g., < 15.0/100h when operators want < 5.0).',
              'Review the Confusion Matrix (Section 2) for the candidate model — how many total FPs are there?',
              'Check the Scenario Chart (Section 4) — is FAR concentrated in one scenario type (e.g., "abandoned_object" has many FPs)?',
              'Look at operator review times in Trace Details — if operators dismiss alerts in <3 seconds, they\'re not really reviewing them.',
            ]}
            actions={[
              'Propose tightening the FAR gate threshold. The current threshold may have been set during an earlier, less strict evaluation cycle.',
              'If FAR is dominated by one scenario, consider a scenario-specific threshold adjustment or additional negative training for that scenario.',
              'Calculate the operator burden: FAR × hours of footage / 100 = alerts per day. If it\'s > 50/day per operator, the system is operationally unsustainable regardless of what the gate says.',
              'Consider a two-tier alert system: high-confidence alerts go directly to operators, low-confidence alerts go to a batch review queue.',
            ]}
          />

          <TroubleshootItem
            title="Candidate is worse than Baseline"
            symptom="A4 (full stack) has lower F1, higher FAR, or worse tIoU than the Baseline model"
            steps={[
              'Check the Model Comparison Strip (Section 1) — which specific metrics regressed?',
              'Compare A1, A2, A3 individually. If A1 and A2 improved but A3 regressed, the event persistence technique is the problem, not the full stack.',
              'If all iterations improved but A4 regressed, the techniques interact badly when combined. Check if temporal smoothing is dampening signals that event persistence depends on.',
              'Examine the Scenario Chart (Section 4) — the regression may be scenario-specific rather than global.',
            ]}
            actions={[
              'If the regression is small (<2% on F1): It may be within noise. Rerun the evaluation with a different random seed or on a larger dataset to confirm.',
              'If the regression is scenario-specific: Consider deploying A3 instead of A4, or create a scenario-specific ensemble that uses different models for different anomaly types.',
              'If the regression is global: The combined architecture needs redesign. The techniques may need to be integrated differently (e.g., smoothing before persistence, not after).',
              'Document the regression clearly in the evaluation report. Even if you deploy A3 instead, the A4 failure is valuable engineering knowledge for the next iteration.',
            ]}
          />
        </div>

        <Callout type="info">
          If your problem isn't listed here, start from Section 1 and work through the 6-step workflow.
          Most issues become visible by Step 3. The panels are designed to be read in sequence — each one
          narrows the search space from "which model?" to "which zone?" to "which trace?" to "which frame?".
        </Callout>
      </section>

    </div>
  );
}

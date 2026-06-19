import React, { useState } from 'react';
import {
  BookOpen, BarChart3, AlertTriangle, Rocket, Database, Activity,
  Layers, Grid3X3, Target, ChevronDown, ChevronRight, ShieldAlert,
  Search, X, FileText
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
}

function DocSection({ number, title, icon, children, rows, defaultOpen = true }: DocSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section style={{ marginBottom: 32 }}>
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
                      whiteSpace: 'normal', // Fixed text wrapping
                    }}>
                      {row.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      {/* Page intro */}
      <div style={{
        padding: '20px 24px', borderRadius: 'var(--radius-md)',
        background: 'var(--accent-glow)', border: '1px solid rgba(139,92,246,0.15)',
      }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
          <BookOpen size={18} color="var(--accent)" />
          <span className="font-semibold" style={{ fontSize: 15 }}>Evaluation Page — Visual Documentation</span>
        </div>
        <div className="text-sm text-secondary" style={{ lineHeight: 1.7 }}>
          This page walks through every panel on the Evaluation screen. Each section shows a live preview of the component,
          followed by a table explaining what it displays, why it matters, and what decisions it supports.
          All previews use real mock data — they are interactive and behave exactly as they do on the Evaluation page.
        </div>
      </div>

      {/* ── Section 1: Model Comparison Strip ── */}
      <DocSection
        number={1}
        title="Model Comparison Strip"
        icon={<BarChart3 size={16} color="var(--accent)" />}
        rows={[
          { label: 'What it shows', content: 'A table of 5 model iterations (Baseline → A4), each with 7 metrics side-by-side. The best value per column is highlighted green. Each row also shows a delta vs. the Baseline.' },
          { label: 'Why it exists', content: 'To answer "Which model is best, and by how much?" in one glance. Model selection has consequences — shipping the wrong model means missed detections or nuisance alerts.' },
          { label: 'How to read it', content: 'Each column is a metric. Green-highlighted cells are the winner for that metric. The small delta numbers show the change from Baseline. Toggle models on/off with the pills at the top to compare any subset.' },
          { label: 'PR-AUC', content: 'Area under the Precision–Recall curve. Higher is better. Measures overall ranking quality — can the model separate real anomalies from noise?' },
          { label: 'F1', content: 'Harmonic mean of precision and recall. A single number that balances "don\'t miss real events" against "don\'t cry wolf".' },
          { label: 'tIoU', content: 'Temporal Intersection-over-Union. Measures how well the detected event window overlaps with the real event. A model can have high F1 but poor tIoU if its timing is off.' },
          { label: 'Precision', content: 'Of everything the model flagged, what percentage was actually a real anomaly? Low precision = too many false alarms.' },
          { label: 'Recall', content: 'Of all real anomalies, what percentage did the model catch? Low recall = missed events.' },
          { label: 'FAR/100h', content: 'False Alarm Rate per 100 hours of footage. Lower is better. This is what operators feel — each false alarm wastes their time.' },
          { label: 'Confirm Rate', content: 'What percentage of alerts were confirmed by operators as genuine? This is the field-truth metric — it reflects real operational trust.' },
        ]}
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
        title="Where It Fails — Confusion Matrices"
        icon={<AlertTriangle size={16} color="var(--color-warn)" />}
        rows={[
          { label: 'What it shows', content: 'A 2×2 grid per model: True Positives (TP), False Positives (FP), False Negatives (FN), True Negatives (TN). Colour-coded: green = TP, red = FP, amber = FN, grey = TN.' },
          { label: 'Why it exists', content: 'F1 and precision are ratios — they hide the raw counts. A confusion matrix shows exactly how many events were caught, missed, or incorrectly flagged. You need the raw numbers to judge whether a model is failing in a way you can live with.' },
          { label: 'How to read it', content: 'Top-left (TP) = correctly detected anomalies. Top-right (FN) = missed anomalies. Bottom-left (FP) = false alarms. Bottom-right (TN) = correctly ignored. Watch for FN trending up (missed events) or FP not dropping between iterations.' },
          { label: 'Key decision', content: 'If FP is high but FN is low, the model is cautious — it catches everything but cries wolf. If FN is high, the model is missing real events. The right trade-off depends on the deployment context.' },
        ]}
      >
        <ConfusionMatricesPanel traces={mockTraces} visibleModels={visibleModels} />
      </DocSection>

      {/* ── Section 3: Zone × Time Heatmap ── */}
      <DocSection
        number={3}
        title="Where It Fails — Zone × Time Heatmap"
        icon={<Grid3X3 size={16} color="var(--color-warn)" />}
        rows={[
          { label: 'What it shows', content: 'A heatmap of F1 score broken down by zone (Atrium, Corridor, Parking, etc.) and time band (Morning Rush, Midday, etc.).' },
          { label: 'Why it exists', content: 'Aggregate metrics mask blind spots. A model with 87% F1 overall might score 40% in "Loading Dock × Late Night". This panel exposes those pockets of failure so you know where the model will break in production.' },
          { label: 'Heatmap colours', content: 'Green (≥85): strong performance. Amber (70–84): acceptable but watch closely. Red (<70): problem area requiring investigation. Grey dash (—): no data for that combination.' },
          { label: 'Key decision', content: 'If a zone×time cell is red, you need to either collect more data for that slice, add targeted training, or set a different threshold for that camera group.' },
        ]}
      >
        {candidateModel ? (
          <ZoneTimeHeatmapPanel traces={mockTraces} candidateModel={candidateModel} candidateId={candidateId} />
        ) : <div />}
      </DocSection>

      {/* ── Section 4: Scenario F1 Bar Chart ── */}
      <DocSection
        number={4}
        title="Where It Fails — Scenario F1 Chart"
        icon={<BarChart3 size={16} color="var(--color-warn)" />}
        rows={[
          { label: 'What it shows', content: 'A horizontal bar chart of F1 per scenario (loitering, tailgating, etc.) for each visible model.' },
          { label: 'Why it exists', content: 'To quickly compare how different model architectures handle specific anomaly types.' },
          { label: 'Scenario chart', content: 'Grouped bars let you compare models per scenario. If A4 beats Baseline on "loitering" but not "tailgating", that tells you the improvement is scenario-specific.' },
        ]}
      >
        <ScenarioBarChartPanel traces={mockTraces} visibleModels={visibleModels} />
      </DocSection>

      {/* ── Section 5: Deployment Verdict Banner ── */}
      <DocSection
        number={5}
        title="Deployment Gates — Verdict"
        icon={<ShieldAlert size={16} color="var(--color-fail)" />}
        rows={[
          { label: 'What it shows', content: 'A ship/no-ship decision banner. Green (READY TO SHIP), amber (CONDITIONAL), or red (BLOCKED).' },
          { label: 'Why it exists', content: 'Provides an immediate, unambiguous answer on whether the current candidate model is safe to deploy.' },
          { label: 'Verdict logic', content: 'If any gate is red → BLOCKED. If all pass but some are amber → CONDITIONAL (needs human review). All green → READY TO SHIP.' },
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
          { label: 'What it shows', content: 'A checklist of 5 gates with pass/fail/warning status, measured values, thresholds, and reviewer sign-offs.' },
          { label: 'Why it exists', content: 'Each gate represents a non-negotiable requirement from a different stakeholder: Track A cares about localisation accuracy, Track B cares about false alarm rate, Ops cares about operator confirmation rate, Infra cares about latency.' },
          { label: 'Gate rows', content: 'Each row shows: gate name, which track it belongs to, the requirement in plain language, the measured value (colour-coded), the threshold, and the reviewer\'s sign-off status (pending / approved / rejected).' },
          { label: 'Key decision', content: 'Do not ship if BLOCKED. If CONDITIONAL, escalate the warning gates to the relevant reviewer.' },
        ]}
      >
        <GateChecklist gates={mockGates} />
      </DocSection>

      {/* ── Section 7: Data Coverage Sidebar ── */}
      <DocSection
        number={7}
        title="Deployment Gates — Coverage"
        icon={<Layers size={16} color="var(--accent)" />}
        rows={[
          { label: 'What it shows', content: 'Four stacked bars: Total traces, Labelled (has ground-truth), Reviewed (checked by a second person), Approved (final sign-off).' },
          { label: 'Why it exists', content: 'To measure the trustworthiness of the evaluation data itself.' },
          { label: 'Data coverage', content: 'The approval rate percentage is the key number — low approval means the evaluation data itself is questionable and evaluation results might be flawed.' },
        ]}
      >
        <DataCoverageSidebar coverage={mockCoverage} />
      </DocSection>

      {/* ── Section 8: Anomaly Evidence Filter ── */}
      <DocSection
        number={8}
        title="Anomaly Evidence — Filter"
        icon={<Search size={16} color="var(--text-primary)" />}
        rows={[
          { label: 'What it shows', content: 'A search box and filter pills for ground truth, zones, and tags.' },
          { label: 'Why it exists', content: 'To slice and dice the trace dataset and find the needle in the haystack.' },
          { label: 'Filters', content: 'Search by trace ID or camera. Filter by ground truth (actionable/benign/unclear), zone, or tag (TP/FP/FN/TN). These filters let you isolate exactly the failures you care about.' },
        ]}
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
        title="Anomaly Evidence — Data"
        icon={<Database size={16} color="var(--text-primary)" />}
        rows={[
          { label: 'What it shows', content: 'A sortable table of traces. Each row shows: trace ID, zone, anomaly score, ground truth, scenario, per-model detection (✓/✗), and tags.' },
          { label: 'Why it exists', content: 'Aggregate numbers don\'t explain why a model fails. This table lets you drill into individual events.' },
          { label: 'Per-model columns', content: 'Each selected model gets a column showing ✓ (detected) or ✗ (missed). This instantly reveals model disagreements — if A4 catches a trace but Baseline doesn\'t, that\'s the value of the upgrade.' },
          { label: 'Key decision', content: 'When a gate fails or a heatmap cell is red, come here to find the specific traces causing the problem. Click a row to see the Trace Details.' },
        ]}
      >
        <EvidenceTable
          filtered={mockTraces.slice(0, 3)} // Show just a few for the doc snapshot
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
          { label: 'What it shows', content: 'The unique trace ID, camera ID, zone type, and time band of the incident.' },
          { label: 'Why it exists', content: 'To uniquely identify the event and provide immediate spatial-temporal context.' },
          { label: 'Close Button', content: 'The X button allows the operator to dismiss the detail slide-in panel.' },
        ]}
      >
        <TraceDetailHeader trace={sampleTrace} />
      </DocSection>

      {/* ── Section 11: Trace Context & Triage ── */}
      <DocSection
        number={11}
        title="Trace Detail — Context"
        icon={<AlertTriangle size={16} color="var(--accent)" />}
        rows={[
          { label: 'What it shows', content: 'Context badges (ground truth, scenario, priority, tags) and Operator Triage (action taken, review time, etc.).' },
          { label: 'Why it exists', content: 'To ground the model\'s output in operational reality.' },
          { label: 'Operator Triage', content: 'What happened in the real world: what action the operator took (confirmed, dismissed, ignored, escalated), how long they spent reviewing, the alert priority, and the annotation status.' },
        ]}
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
          { label: 'Why it exists', content: 'To understand the temporal dynamics of the model\'s confidence. Was it a sharp spike or a sustained anomaly?' },
          { label: 'Score lines', content: 'The raw score shows the per-frame output. The smoothed line shows the temporal aggregation. If the smoothed line crosses the threshold, an alert is triggered.' },
        ]}
      >
        <TraceScoreTimeline trace={sampleTrace} />
      </DocSection>

      {/* ── Section 13: Trace Pipeline Execution ── */}
      <DocSection
        number={13}
        title="Trace Detail — Pipeline Execution"
        icon={<Activity size={16} color="var(--accent)" />}
        rows={[
          { label: 'What it shows', content: 'A horizontal flame chart showing how long each processing stage took: Frame Decode → Object Detection → Feature Extraction → Temporal Model.' },
          { label: 'Why it exists', content: 'To spot performance bottlenecks and measure latency.' },
          { label: 'Pipeline Execution', content: 'Total latency is summed at the top. The visual chart helps identify which stage is taking the most time.' },
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
          { label: 'What it shows', content: 'A gauge bar per model showing the confidence score for this trace. The red line marks the threshold.' },
          { label: 'Why it exists', content: 'To diagnose model-specific failures on a single event.' },
          { label: 'Model Scores', content: 'Models that cross the threshold show "DETECTED"; those below show "SILENT". Compare gauges to understand why one model caught an event and another didn\'t.' },
          { label: 'Key decision', content: 'If the model scores cluster just below the threshold, a small threshold adjustment might fix it. If all scores are low, the model genuinely doesn\'t see the anomaly and needs architectural changes.' },
        ]}
      >
        <TraceModelScores trace={sampleTrace} models={mockModels} />
      </DocSection>

    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ScatterChart, Scatter, ZAxis, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain, Cpu, Target, AlertTriangle, BookOpen, Zap, Shield,
  ChevronDown, ChevronRight, ExternalLink, Lightbulb, TrendingUp,
  Eye, MessageSquare, Layers, Box, ArrowRight, CheckCircle2,
  XCircle, Clock, Gauge, FlaskConical, Microscope, Radio,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   DATA — Structured from the research report
   ═══════════════════════════════════════════════════════════ */

interface ResearchPaper {
  id: string;
  title: string;
  venue: string;
  year: number;
  area: string;
  description: string;
  keyInsight: string;
  relevance: number; // 0-100 relevance to user's pipeline
  adoptionEffort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'applicable' | 'monitor' | 'future';
}

const papers: ResearchPaper[] = [
  {
    id: 'exvad', title: 'Ex-VAD', venue: 'Preprint', year: 2025,
    area: 'Vision-Language', description: 'Generates natural language explanations for detected anomalies by composing descriptive sentences from video frames.',
    keyInsight: 'Replace binary anomaly scores with human-readable event descriptions. Instead of "score: 0.87", output "A man has broken the glass".',
    relevance: 85, adoptionEffort: 'high', impact: 'high', status: 'applicable',
  },
  {
    id: 'vera', title: 'VERA', venue: 'CVPR 2025', year: 2025,
    area: 'Vision-Language', description: 'Eliminates manual label coding by generating "reflective questions" to guide anomaly detection during live monitoring.',
    keyInsight: 'Self-supervised training via auto-generated questions like "Is anyone behaving aggressively?" — removes the labelling bottleneck entirely.',
    relevance: 78, adoptionEffort: 'medium', impact: 'high', status: 'applicable',
  },
  {
    id: 'lagovad', title: 'LaGoVAD', venue: 'ICLR 2026', year: 2026,
    area: 'Vision-Language', description: 'Operators can type new anomaly definitions in natural language daily. Text-driven anomaly policy that adapts without retraining.',
    keyInsight: 'Decouples anomaly definition from model training. Typing "person not wearing a mask" instantly makes it detectable.',
    relevance: 92, adoptionEffort: 'high', impact: 'high', status: 'applicable',
  },
  {
    id: 'dsanet', title: 'DSANet', venue: 'AAAI 2026', year: 2026,
    area: 'Weak Supervision', description: 'Separates normal background from anomalous events, preventing confusion when normal and abnormal actions look visually similar.',
    keyInsight: 'Dual-stream architecture isolates scene context from event content — critical for environments with visually similar normal/abnormal patterns.',
    relevance: 75, adoptionEffort: 'medium', impact: 'medium', status: 'applicable',
  },
  {
    id: 'lasvad', title: 'LAS-VAD', venue: 'CVPR 2026', year: 2026,
    area: 'Weak Supervision', description: 'Groups video frames to deduce human intent, distinguishing normal actions from anomalous ones with identical appearance.',
    keyInsight: 'Intent-aware grouping: reaching for a shelf (normal) vs. shoplifting (anomalous) — same visual pattern, different intent.',
    relevance: 70, adoptionEffort: 'medium', impact: 'high', status: 'monitor',
  },
  {
    id: 'lecvad', title: 'LEC-VAD', venue: 'Preprint 2025/2026', year: 2025,
    area: 'Weak Supervision', description: 'Anomaly-aware Gaussian mixture for precise event boundaries. Uses a "text memory bank" of descriptions to refine detection.',
    keyInsight: 'Precise temporal boundaries via Gaussian mixture — directly addresses the fragmented alert problem in Track A.',
    relevance: 88, adoptionEffort: 'medium', impact: 'high', status: 'applicable',
  },
  {
    id: 'maskad', title: 'MaskAD', venue: 'Recent', year: 2025,
    area: 'Technical Innovation', description: 'Fixes the autoencoder shortcut by randomly masking image regions, forcing context deduction instead of memorization.',
    keyInsight: 'Modern autoencoders reconstruct anomalies too well — masking prevents this shortcut and restores discriminative power.',
    relevance: 65, adoptionEffort: 'low', impact: 'medium', status: 'applicable',
  },
  {
    id: 'tao', title: 'TAO Framework', venue: 'CVPR 2025', year: 2025,
    area: 'Granular Tracking', description: 'Draws pixel-level bounding boxes around specific anomalous objects and tracks them through crowds.',
    keyInsight: 'Move from frame-level "something is wrong" to object-level "this person at coordinates (x,y) is the anomaly" with persistent tracking.',
    relevance: 72, adoptionEffort: 'high', impact: 'high', status: 'monitor',
  },
  {
    id: 'frames-to-events', title: 'From Frames to Events', venue: '2026 Paper', year: 2026,
    area: 'Evaluation Reform', description: 'Argues frame-level AUC is fundamentally broken. Proposes event-level evaluation with temporal IoU.',
    keyInsight: 'Your pipeline already uses tIoU — you are ahead of most academic benchmarks. But verify your event merging logic matches the proposed standard.',
    relevance: 95, adoptionEffort: 'low', impact: 'high', status: 'applicable',
  },
  {
    id: 'misframed', title: 'Is VAD Misframed?', venue: '2026 Paper', year: 2026,
    area: 'Evaluation Reform', description: 'Exposes single-scene vs. multi-scene training mismatch. Real cameras are fixed; diverse training data hurts local normality learning.',
    keyInsight: 'Per-camera fine-tuning or local normality banks may outperform globally trained models in deployment.',
    relevance: 90, adoptionEffort: 'medium', impact: 'high', status: 'applicable',
  },
];

interface BenchmarkDataset {
  name: string;
  focus: string;
  sotaLow: number;
  sotaHigh: number;
  yourModel: number | null;
  difficulty: 'solved' | 'near-solved' | 'active' | 'frontier';
}

const benchmarks: BenchmarkDataset[] = [
  { name: 'UCSD Ped2', focus: 'Pedestrian motion', sotaLow: 97.9, sotaHigh: 98.4, yourModel: 96.2, difficulty: 'solved' },
  { name: 'CUHK Avenue', focus: 'Sudden behaviours', sotaLow: 86.8, sotaHigh: 87.1, yourModel: 84.5, difficulty: 'near-solved' },
  { name: 'ShanghaiTech', focus: 'Complex campus', sotaLow: 75.6, sotaHigh: 85.3, yourModel: 79.8, difficulty: 'active' },
  { name: 'UCF-Crime', focus: 'Real-world CCTV', sotaLow: 80.9, sotaHigh: 82.2, yourModel: 78.3, difficulty: 'active' },
  { name: 'XD-Violence', focus: 'Audio-visual violence', sotaLow: 90.6, sotaHigh: 94.0, yourModel: null, difficulty: 'frontier' },
];

interface HardwarePlatform {
  name: string;
  tops: number;
  bandwidth: string;
  power: string;
  fps: number;
  status: 'eol' | 'active' | 'preview';
  price: string;
  recommendation: string;
}

const hardware: HardwarePlatform[] = [
  { name: 'Jetson Nano', tops: 0.5, bandwidth: '25.6 GB/s', power: '5-10W', fps: 8, status: 'eol', price: '$149', recommendation: 'Retire — insufficient for temporal models' },
  { name: 'Jetson Orin Nano 8GB', tops: 40, bandwidth: '102 GB/s', power: '7-15W', fps: 36, status: 'active', price: '$249', recommendation: 'Production target — runs A4 pipeline at 36 FPS' },
  { name: 'Jetson Orin Nano Super', tops: 67, bandwidth: '102 GB/s', power: '7-25W', fps: 48, status: 'active', price: '$299', recommendation: 'Premium — enables future LLM-assisted triage on-device' },
  { name: 'Neuromorphic SNN', tops: 15, bandwidth: 'Event-driven', power: '5-65W', fps: 100, status: 'preview', recommendation: 'Future — sub-10ms latency, but ecosystem immature' , price: 'TBD'},
];

interface GapItem {
  area: string;
  currentState: string;
  sotaState: string;
  gap: 'ahead' | 'aligned' | 'behind' | 'missing';
  recommendation: string;
  papers: string[];
  priority: number;
}

const gaps: GapItem[] = [
  {
    area: 'Event-Level Evaluation',
    currentState: 'Using tIoU metric in pipeline',
    sotaState: 'Proposed as new standard in 2026 papers',
    gap: 'aligned',
    recommendation: 'Verify event merging logic aligns with the emerging standard.',
    papers: ['frames-to-events'],
    priority: 1,
  },
  {
    area: 'Temporal Smoothing',
    currentState: 'A4 model includes temporal convolution (Track A fix)',
    sotaState: 'LEC-VAD uses Gaussian mixture for precise boundaries',
    gap: 'aligned',
    recommendation: 'Current approach works. Monitor LEC-VAD for potential boundary precision improvements.',
    papers: ['lecvad'],
    priority: 3,
  },
  {
    area: 'Natural Language Explainability',
    currentState: 'Binary anomaly scores only',
    sotaState: 'Ex-VAD and VERA generate text descriptions',
    gap: 'behind',
    recommendation: 'High-impact gap. Integrate LLM-based explanation generation to reduce operator cognitive load. Start with Ex-VAD approach on high-priority alerts.',
    papers: ['exvad', 'vera'],
    priority: 2,
  },
  {
    area: 'Dynamic Anomaly Definitions',
    currentState: 'Fixed model retraining required',
    sotaState: 'LaGoVAD allows text-based policy changes without retraining',
    gap: 'missing',
    recommendation: 'Highest-impact capability gap. LaGoVAD-style text prompts would let operators define new anomalies daily without engineering involvement.',
    papers: ['lagovad'],
    priority: 1,
  },
  {
    area: 'Per-Camera Normality',
    currentState: 'Single global model across all cameras',
    sotaState: '"Is VAD Misframed?" proves per-camera fine-tuning outperforms',
    gap: 'behind',
    recommendation: 'Implement local normality banks per camera. This directly addresses Track B false alarms (cleaners in loading dock).',
    papers: ['misframed'],
    priority: 2,
  },
  {
    area: 'Object-Level Tracking',
    currentState: 'Frame-level anomaly detection',
    sotaState: 'TAO provides pixel-level bounding boxes with persistent tracking',
    gap: 'behind',
    recommendation: 'Medium priority. TAO-style tracking would enable "follow this person" workflows for operators.',
    papers: ['tao'],
    priority: 4,
  },
  {
    area: 'Intent Recognition',
    currentState: 'Appearance-based detection',
    sotaState: 'LAS-VAD deduces intent from action sequences',
    gap: 'missing',
    recommendation: 'Future capability. Intent recognition would eliminate the reaching-vs-shoplifting ambiguity class.',
    papers: ['lasvad'],
    priority: 5,
  },
  {
    area: 'Edge Hardware',
    currentState: 'Assumed cloud/server deployment',
    sotaState: 'Orin Nano Super runs full pipelines at 48 FPS',
    gap: 'behind',
    recommendation: 'Validate A4 pipeline on Orin Nano 8GB. Layer fusion can unlock 36+ FPS at 15W per camera.',
    papers: [],
    priority: 3,
  },
];

const caseStudies = [
  {
    id: 'track-a',
    title: 'Track A — The Skateboarder',
    icon: '🛹',
    type: 'Missed Event (False Negative)',
    problem: 'A skateboarder weaving through a busy atrium posed a safety risk. The AI saw the anomaly but generated short, fragmented bursts of scores — multiple sub-threshold micro-alerts instead of one cohesive event.',
    rootCause: 'Frame-level detection without temporal context. Each frame was marginally anomalous, but the continuous event was clearly dangerous.',
    fix: 'Temporal smoothing (1D convolution) to stitch fragmented scores into one sustained alert above threshold.',
    fixType: 'Pipeline fix — not a model change',
    impact: 'Implemented in A2→A3 ablation. Event recall improved from 0.65 to 0.80.',
    researchLink: 'Directly addressed by LEC-VAD\'s Gaussian mixture approach and the "Frames to Events" evaluation reform.',
    status: 'resolved' as const,
  },
  {
    id: 'track-b',
    title: 'Track B — Authorised Cleaners',
    icon: '🧹',
    type: 'Nuisance Alert (False Positive)',
    problem: 'Cleaners pushing reflective trolleys in a loading area late at night generated persistent false alarms. The AI correctly identified the activity as statistically unusual for that time/location.',
    rootCause: 'Global normality model lacks per-camera context. Cleaning crew is normal for that specific camera at that time, but abnormal globally.',
    fix: 'Triage policy adjustment — not a model change. The anomaly engine was correct; the escalation logic was wrong.',
    fixType: 'Triage policy fix — anomaly engine is correct',
    impact: 'FAR reduced from 14.2 to 6.8 per 100h after hysteresis thresholding (A3) and triage policy update.',
    researchLink: '"Is VAD Misframed?" paper directly explains this failure mode. Per-camera normality banks would prevent it structurally.',
    status: 'mitigated' as const,
  },
];

const maturityData = [
  { axis: 'Explainability', current: 20, sota: 85, importance: 90 },
  { axis: 'Temporal Precision', current: 75, sota: 90, importance: 95 },
  { axis: 'Dynamic Policies', current: 5, sota: 80, importance: 85 },
  { axis: 'Object Tracking', current: 15, sota: 75, importance: 60 },
  { axis: 'Edge Deployment', current: 10, sota: 70, importance: 70 },
  { axis: 'Eval Methodology', current: 80, sota: 85, importance: 100 },
  { axis: 'Weak Supervision', current: 40, sota: 85, importance: 65 },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function ResearchInsights() {
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [expandedCase, setExpandedCase] = useState<string | null>('track-a');
  const [selectedRoadmapFilter, setSelectedRoadmapFilter] = useState<'all' | 'applicable' | 'monitor' | 'future'>('all');

  const sortedGaps = useMemo(() => [...gaps].sort((a, b) => a.priority - b.priority), []);

  const filteredPapers = useMemo(() => {
    if (selectedRoadmapFilter === 'all') return papers;
    return papers.filter(p => p.status === selectedRoadmapFilter);
  }, [selectedRoadmapFilter]);

  return (
    <div className="flex-col gap-6" style={{ paddingBottom: 32 }}>

      {/* ── Section 1: Research Maturity Radar ── */}
      <section id="capability-radar">
        <div className="section-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="section-title">Capability Maturity Radar</h2>
            </div>
            <p className="section-subtitle">Pipeline capabilities across 7 dimensions.</p>
          </div>
        </div>
        <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>
          <div className="card flex-1" style={{ padding: 12 }}>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={maturityData} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 500 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                    axisLine={false}
                  />
                  <Radar name="Your Pipeline" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="State of the Art" dataKey="sota" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.08} strokeWidth={2} strokeDasharray="4 4" />
                  <Radar name="Business Importance" dataKey="importance" stroke="#f59e0b" fill="transparent" strokeWidth={1} strokeDasharray="2 2" />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    iconType="line"
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Maturity Legend */}
          <div className="flex-col gap-2 shrink-0" style={{ width: 300 }}>
            {maturityData.map(d => {
              const gapSize = d.sota - d.current;
              const gapColor = gapSize > 50 ? 'var(--color-fail)' : gapSize > 25 ? 'var(--color-warn)' : 'var(--color-pass)';
              const gapLabel = gapSize > 50 ? 'Large gap' : gapSize > 25 ? 'Moderate gap' : 'Aligned';
              return (
                <div key={d.axis} className="card" style={{ padding: '10px 14px' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">{d.axis}</span>
                    <span className="badge" style={{
                      background: gapSize > 50 ? 'var(--color-fail-muted)' : gapSize > 25 ? 'var(--color-warn-muted)' : 'var(--color-pass-muted)',
                      color: gapColor,
                      border: `1px solid ${gapColor}22`,
                      fontSize: 9, padding: '1px 6px',
                    }}>
                      {gapLabel}
                    </span>
                  </div>
                  <div className="flex gap-4 items-center" style={{ marginTop: 6 }}>
                    <div className="flex-1">
                      <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-hover)', position: 'relative' }}>
                        <div style={{ position: 'absolute', height: '100%', borderRadius: 2, background: '#10b981', width: `${d.current}%` }} />
                        <div style={{
                          position: 'absolute', top: -3, height: 10, width: 2, borderRadius: 1,
                          background: '#8b5cf6', left: `${d.sota}%`,
                        }} />
                      </div>
                    </div>
                    <span className="font-mono text-xs" style={{ color: '#10b981', minWidth: 28, textAlign: 'right' }}>{d.current}</span>
                    <span className="text-muted" style={{ fontSize: 10 }}>/ {d.sota}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 2: Gap Analysis & Recommendations ── */}
      <section id="gap-analysis">
        <div className="section-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="section-title">Gap Analysis & Recommendations</h2>
            </div>
            <p className="section-subtitle">Prioritised capability gaps with actionable next steps. Ordered by business impact.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '12px' }}>
          {sortedGaps.map((gap, i) => {
            const gapIcon = gap.gap === 'aligned' ? <CheckCircle2 size={16} /> :
              gap.gap === 'behind' ? <AlertTriangle size={16} /> :
              <XCircle size={16} />;
            const gapColor = gap.gap === 'aligned' ? 'var(--color-pass)' :
              gap.gap === 'behind' ? 'var(--color-warn)' :
              'var(--color-fail)';
            const gapBg = gap.gap === 'aligned' ? 'var(--color-pass-muted)' :
              gap.gap === 'behind' ? 'var(--color-warn-muted)' :
              'var(--color-fail-muted)';

            return (
              <div key={gap.area} className="card" style={{ padding: '12px 14px' }}>
                <div className="flex gap-3 items-start">
                  <div style={{
                    width: 24, height: 24, borderRadius: 'var(--radius-sm)',
                    background: gapBg, color: gapColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 2,
                  }}>
                    {gapIcon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 6 }}>
                      <span className="font-semibold text-sm truncate">{gap.area}</span>
                      <span className="badge" style={{ background: gapBg, color: gapColor, border: 'none', fontSize: 9, padding: '1px 6px' }}>
                        {gap.gap.toUpperCase()}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: 9, padding: '1px 6px' }}>
                        P{gap.priority}
                      </span>
                    </div>
                    <div className="flex-col gap-1" style={{ fontSize: 11, marginBottom: 8 }}>
                      <div className="truncate">
                        <span className="text-muted">Current: </span>
                        <span className="text-secondary">{gap.currentState}</span>
                      </div>
                      <div className="truncate">
                        <span className="text-muted">SOTA: </span>
                        <span className="text-secondary">{gap.sotaState}</span>
                      </div>
                    </div>
                    <div style={{
                      background: 'var(--accent-glow)', borderLeft: '3px solid var(--accent)',
                      padding: '8px 12px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                      fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6,
                    }}>
                      <Lightbulb size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--accent)' }} />
                      {gap.recommendation}
                    </div>
                    {gap.papers.length > 0 && (
                      <div className="flex gap-2 items-center" style={{ marginTop: 6 }}>
                        <BookOpen size={11} color="var(--text-muted)" />
                        {gap.papers.map(pId => {
                          const p = papers.find(pp => pp.id === pId);
                          return p ? (
                            <span key={pId} className="badge badge-neutral" style={{ fontSize: 9, cursor: 'pointer' }}
                              onClick={() => setExpandedPaper(expandedPaper === pId ? null : pId)}>
                              {p.title} ({p.venue})
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 3: Benchmark Landscape ── */}
      <section id="benchmark-landscape">
        <div className="section-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="section-title">Benchmark Landscape</h2>
            </div>
            <p className="section-subtitle">Model AUC performance mapped against standard datasets.</p>
          </div>
        </div>
        <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>
          <div className="card flex-1" style={{ padding: 12 }}>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={benchmarks.map(b => ({
                    name: b.name,
                    sotaRange: b.sotaHigh,
                    sotaLow: b.sotaLow,
                    yours: b.yourModel,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={false} />
                  <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-md)', fontSize: 12,
                    }}
                  />
                  <Bar dataKey="sotaRange" name="SOTA High" fill="#8b5cf6" radius={[0, 3, 3, 0]} barSize={10} opacity={0.4} />
                  <Bar dataKey="yours" name="Your Model (A4)" fill="#10b981" radius={[0, 3, 3, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Benchmark Details Table */}
          <div className="card shrink-0" style={{ width: 360, padding: 16 }}>
            <div className="card-title">Dataset Difficulty Assessment</div>
            <div className="flex-col gap-2">
              {benchmarks.map(b => {
                const diffColor = b.difficulty === 'solved' ? 'var(--color-pass)' :
                  b.difficulty === 'near-solved' ? 'var(--color-info)' :
                  b.difficulty === 'active' ? 'var(--color-warn)' : 'var(--color-fail)';
                const diffBg = b.difficulty === 'solved' ? 'var(--color-pass-muted)' :
                  b.difficulty === 'near-solved' ? 'var(--color-info-muted)' :
                  b.difficulty === 'active' ? 'var(--color-warn-muted)' : 'var(--color-fail-muted)';

                return (
                  <div key={b.name} style={{
                    padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
                  }}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">{b.name}</span>
                      <span className="badge" style={{ background: diffBg, color: diffColor, border: 'none', fontSize: 9 }}>
                        {b.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-muted" style={{ marginTop: 2 }}>{b.focus}</div>
                    <div className="flex gap-3 items-center" style={{ marginTop: 4 }}>
                      <span className="text-xs text-muted">SOTA: <span className="font-mono" style={{ color: '#8b5cf6' }}>{b.sotaLow}–{b.sotaHigh}%</span></span>
                      {b.yourModel !== null ? (
                        <span className="text-xs text-muted">Yours: <span className="font-mono" style={{ color: '#10b981' }}>{b.yourModel}%</span></span>
                      ) : (
                        <span className="text-xs text-muted">Not evaluated</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Case Studies ── */}
      <section id="case-studies">
        <div className="section-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="section-title">Real-World Failure Case Studies</h2>
            </div>
            <p className="section-subtitle">Operational failures from the self-learning CCTV platform — what broke and what fixed it.</p>
          </div>
        </div>
        <div className="flex gap-4">
          {caseStudies.map(cs => (
            <motion.div
              key={cs.id}
              className="card flex-1"
              style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => setExpandedCase(expandedCase === cs.id ? null : cs.id)}
              layout
            >
              {/* Header */}
              <div style={{
                padding: '12px 14px',
                background: cs.status === 'resolved' ? 'var(--color-pass-muted)' : 'var(--color-warn-muted)',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 24 }}>{cs.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{cs.title}</div>
                    <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                      <span className={`badge ${cs.status === 'resolved' ? 'badge-pass' : 'badge-warn'}`} style={{ fontSize: 9 }}>
                        {cs.status}
                      </span>
                      <span className="text-xs text-muted">{cs.type}</span>
                    </div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    {expandedCase === cs.id ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
                  </div>
                </div>
              </div>

              {/* Expandable body */}
              <AnimatePresence>
                {expandedCase === cs.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="flex-col gap-3" style={{ padding: '12px 14px' }}>
                      {/* Problem */}
                      <div>
                        <div className="text-muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                          Problem
                        </div>
                        <div className="text-sm" style={{ lineHeight: 1.6 }}>{cs.problem}</div>
                      </div>

                      {/* Root Cause */}
                      <div>
                        <div className="text-muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                          Root Cause
                        </div>
                        <div className="text-sm" style={{ lineHeight: 1.6 }}>{cs.rootCause}</div>
                      </div>

                      {/* Fix */}
                      <div style={{
                        background: 'var(--accent-glow)', borderLeft: '3px solid var(--accent)',
                        padding: '10px 14px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                      }}>
                        <div className="text-muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                          Fix Applied
                        </div>
                        <div className="text-sm" style={{ lineHeight: 1.6 }}>{cs.fix}</div>
                        <div className="badge badge-info" style={{ marginTop: 6, fontSize: 9 }}>{cs.fixType}</div>
                      </div>

                      {/* Impact */}
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="text-muted" style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                            Impact
                          </div>
                          <div className="text-sm text-secondary" style={{ lineHeight: 1.6 }}>{cs.impact}</div>
                        </div>
                      </div>

                      {/* External Link */}
                      <div style={{
                        padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                        border: '1px dashed var(--border-default)', background: 'var(--bg-hover)',
                      }}>
                        <div className="flex items-start gap-2">
                          <BookOpen size={12} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span className="text-xs text-secondary" style={{ lineHeight: 1.5 }}>{cs.researchLink}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Edge Hardware Readiness ── */}
      <section id="edge-hardware">
        <div className="section-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="section-title">Edge Hardware Readiness</h2>
            </div>
            <p className="section-subtitle">Can your A4 pipeline run on edge? Hardware comparison with deployment recommendations.</p>
          </div>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-scroll-container">
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: 16 }}>Platform</th>
                <th style={{ textAlign: 'right' }}>AI TOPS</th>
                <th style={{ textAlign: 'right' }}>Memory BW</th>
                <th style={{ textAlign: 'right' }}>Power</th>
                <th style={{ textAlign: 'right' }}>Est. FPS</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th>Status</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {hardware.map(hw => (
                <tr key={hw.name} className={hw.name === 'Jetson Orin Nano 8GB' ? 'row-highlight' : ''}>
                  <td style={{ paddingLeft: 16 }}>
                    <span className="font-semibold text-sm">{hw.name}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono font-semibold text-xs">{hw.tops}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono text-xs text-secondary">{hw.bandwidth}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono text-xs text-secondary">{hw.power}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono font-semibold text-xs" style={{
                      color: hw.fps >= 30 ? 'var(--color-pass)' : hw.fps >= 15 ? 'var(--color-warn)' : 'var(--color-fail)',
                    }}>
                      {hw.fps} FPS
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="font-mono text-xs text-secondary">{hw.price}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      hw.status === 'active' ? 'badge-pass' :
                      hw.status === 'eol' ? 'badge-fail' : 'badge-info'
                    }`} style={{ fontSize: 9 }}>
                      {hw.status === 'eol' ? 'EOL' : hw.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-secondary" style={{ maxWidth: 260, display: 'inline-block' }}>
                      {hw.recommendation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* FPS threshold guidance */}
        <div className="flex gap-4" style={{ marginTop: 12 }}>
          <div className="card flex-1" style={{ padding: '12px 16px' }}>
            <div className="flex items-center gap-3">
              <div className="gate-icon pass"><Zap size={14} /></div>
              <div>
                <div className="text-sm font-semibold">≥30 FPS — Real-time capable</div>
                <div className="text-xs text-muted">Meets SLA for live monitoring with temporal models</div>
              </div>
            </div>
          </div>
          <div className="card flex-1" style={{ padding: '12px 16px' }}>
            <div className="flex items-center gap-3">
              <div className="gate-icon warn"><Clock size={14} /></div>
              <div>
                <div className="text-sm font-semibold">15-29 FPS — Near-real-time</div>
                <div className="text-xs text-muted">Acceptable with frame sampling, minor latency increase</div>
              </div>
            </div>
          </div>
          <div className="card flex-1" style={{ padding: '12px 16px' }}>
            <div className="flex items-center gap-3">
              <div className="gate-icon fail"><AlertTriangle size={14} /></div>
              <div>
                <div className="text-sm font-semibold">&lt;15 FPS — Insufficient</div>
                <div className="text-xs text-muted">Temporal models degrade, event boundaries unreliable</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Technical Literature ── */}
      <section id="technical-literature">
        <div className="section-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="section-title">Technical Literature</h2>
            </div>
            <p className="section-subtitle">Key references scored by relevance to your pipeline. Click to expand.</p>
          </div>
          <div className="flex gap-2">
            {(['all', 'applicable', 'monitor', 'future'] as const).map(f => (
              <button
                key={f}
                className={`filter-pill ${selectedRoadmapFilter === f ? 'active' : ''}`}
                onClick={() => setSelectedRoadmapFilter(f)}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="pill-count">
                  {f === 'all' ? papers.length : papers.filter(p => p.status === f).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-col gap-2">
          {filteredPapers
            .sort((a, b) => b.relevance - a.relevance)
            .map(paper => {
              const isExpanded = expandedPaper === paper.id;
              const relevColor = paper.relevance >= 85 ? 'var(--color-pass)' :
                paper.relevance >= 70 ? 'var(--color-info)' : 'var(--text-secondary)';
              const statusColor = paper.status === 'applicable' ? 'badge-pass' :
                paper.status === 'monitor' ? 'badge-info' : 'badge-neutral';
              const effortColor = paper.adoptionEffort === 'low' ? 'badge-pass' :
                paper.adoptionEffort === 'medium' ? 'badge-warn' : 'badge-fail';
              const impactColor = paper.impact === 'high' ? 'badge-pass' :
                paper.impact === 'medium' ? 'badge-info' : 'badge-neutral';

              return (
                <div
                  key={paper.id}
                  className="card"
                  style={{ padding: '12px 16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onClick={() => setExpandedPaper(isExpanded ? null : paper.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Relevance score */}
                    <div className="shrink-0 flex-col items-center justify-center" style={{ width: 44 }}>
                      <span className="font-mono font-bold" style={{ fontSize: 18, color: relevColor }}>{paper.relevance}</span>
                      <span className="text-muted" style={{ fontSize: 8, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Relevance</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{paper.title}</span>
                        <span className="text-xs text-muted">— {paper.venue} {paper.year}</span>
                        <span className={`badge ${statusColor}`} style={{ fontSize: 9, padding: '1px 5px' }}>{paper.status}</span>
                      </div>
                      <div className="text-xs text-secondary" style={{ marginTop: 2 }}>{paper.area}</div>
                    </div>

                    <div className="flex gap-2 items-center shrink-0">
                      <span className="text-muted" style={{ fontSize: 9, textTransform: 'uppercase', fontWeight: 600 }}>Effort:</span>
                      <span className={`badge ${effortColor}`} style={{ fontSize: 9, padding: '1px 5px' }}>{paper.adoptionEffort}</span>
                      <span className="text-muted" style={{ fontSize: 9, textTransform: 'uppercase', fontWeight: 600, marginLeft: 4 }}>Impact:</span>
                      <span className={`badge ${impactColor}`} style={{ fontSize: 9, padding: '1px 5px' }}>{paper.impact}</span>
                    </div>

                    {isExpanded ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ paddingTop: 12, marginTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                          <div className="text-sm text-secondary" style={{ lineHeight: 1.6, marginBottom: 8 }}>{paper.description}</div>
                          <div style={{
                            background: 'var(--accent-glow)', borderLeft: '3px solid var(--accent)',
                            padding: '8px 12px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                            fontSize: 12, lineHeight: 1.6,
                          }}>
                            <Lightbulb size={12} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle', color: 'var(--accent)' }} />
                            <strong>Key Insight: </strong>{paper.keyInsight}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
        </div>
      </section>

      {/* ── Section 7: Evaluation Methodology Critique ── */}
      <section id="eval-methodology">
        <div className="section-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="section-title">Evaluation Methodology Critique</h2>
            </div>
            <p className="section-subtitle">Structural flaws identified by 2026 papers.</p>
          </div>
        </div>
        <div className="flex gap-4">
          {/* Flaw 1: Frame-level grading */}
          <div className="card flex-1" style={{ padding: 14 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <Eye size={16} color="var(--color-fail)" />
              <span className="font-semibold text-sm">Frame-Level Grading is Broken</span>
            </div>
            <div className="text-xs text-secondary" style={{ lineHeight: 1.6, marginBottom: 12 }}>
              Grading on isolated video frames (AUC per frame) rather than continuous events. High frame AUC does not correlate to usable alerts.
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-pass-muted)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                <CheckCircle2 size={14} color="var(--color-pass)" />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-pass)' }}>ALIGNED WITH STANDARD</span>
              </div>
              <div className="text-xs text-secondary" style={{ lineHeight: 1.5 }}>
                Pipeline uses event-level tIoU evaluation. This aligns with the standard proposed in "From Frames to Events" (2026).
              </div>
            </div>
          </div>

          {/* Flaw 2: Single-scene */}
          <div className="card flex-1" style={{ padding: 14 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <Layers size={16} color="var(--color-warn)" />
              <span className="font-semibold text-sm">Single-Scene Reality Mismatch</span>
            </div>
            <div className="text-xs text-secondary" style={{ lineHeight: 1.6, marginBottom: 12 }}>
              Training on diverse global datasets hurts "local normality" learning. Real cameras are fixed — AI must learn what's normal for that specific room, not the world.
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-warn-muted)', border: '1px solid rgba(245,158,11,0.2)',
            }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                <AlertTriangle size={14} color="var(--color-warn)" />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-warn)' }}>ACTION NEEDED</span>
              </div>
              <div className="text-xs text-secondary" style={{ lineHeight: 1.5 }}>
                Your global model caused Track B false alarms (cleaners). Implement per-camera normality banks to learn local patterns.
              </div>
            </div>
          </div>

          {/* Flaw 3: LLM bias */}
          <div className="card flex-1" style={{ padding: 14 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <MessageSquare size={16} color="var(--color-info)" />
              <span className="font-semibold text-sm">Language Model Bias</span>
            </div>
            <div className="text-xs text-secondary" style={{ lineHeight: 1.6, marginBottom: 12 }}>
              Pre-trained LLMs recognise extreme categories (fires, assaults) but miss subtle, site-specific anomalies because of training data bias toward dramatic events.
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-info-muted)', border: '1px solid rgba(59,130,246,0.2)',
            }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                <Radio size={14} color="var(--color-info)" />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-info)' }}>MONITOR</span>
              </div>
              <div className="text-xs text-secondary" style={{ lineHeight: 1.5 }}>
                Not yet applicable — you don't use LLMs in the pipeline. But when you adopt Ex-VAD/VERA, expect bias toward dramatic events. Plan for site-specific fine-tuning.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 8: Adoption Roadmap ── */}
      <section id="adoption-roadmap">
        <div className="section-header">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="section-title">Adoption Roadmap</h2>
            </div>
            <p className="section-subtitle">Prioritised technology adoption path based on effort vs. impact analysis.</p>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="flex-col gap-1">
            {/* Phase headers */}
            <div className="flex gap-4 items-center" style={{ marginBottom: 12 }}>
              <Phase label="NOW" color="var(--color-pass)" description="Low effort, high impact — implement immediately" />
              <Phase label="NEXT" color="var(--color-info)" description="Medium effort — plan for next sprint cycle" />
              <Phase label="LATER" color="var(--accent)" description="High effort — strategic R&D investment" />
              <Phase label="WATCH" color="var(--text-muted)" description="Future tech — monitor developments" />
            </div>

            {/* NOW */}
            <RoadmapRow
              phase="NOW" color="var(--color-pass)"
              items={[
                { title: 'Validate tIoU alignment', desc: 'Verify event merging logic matches the "Frames to Events" standard', papers: ['From Frames to Events'] },
                { title: 'MaskAD integration', desc: 'Apply random masking to autoencoder to prevent reconstruction shortcut', papers: ['MaskAD'] },
              ]}
            />
            {/* NEXT */}
            <RoadmapRow
              phase="NEXT" color="var(--color-info)"
              items={[
                { title: 'Per-camera normality banks', desc: 'Local normality model per camera to eliminate Track B failures', papers: ['Is VAD Misframed?'] },
                { title: 'LEC-VAD boundary precision', desc: 'Gaussian mixture for event boundary detection — upgrade temporal smoothing', papers: ['LEC-VAD'] },
                { title: 'Edge deployment on Orin Nano', desc: 'Validate A4 pipeline on Jetson Orin Nano 8GB with layer fusion', papers: [] },
              ]}
            />
            {/* LATER */}
            <RoadmapRow
              phase="LATER" color="var(--accent)"
              items={[
                { title: 'Natural language explainability', desc: 'Integrate LLM-based explanation generation for operator alerts (Ex-VAD approach)', papers: ['Ex-VAD', 'VERA'] },
                { title: 'Dynamic anomaly definitions', desc: 'LaGoVAD-style text prompts for operator-defined anomaly policies', papers: ['LaGoVAD'] },
              ]}
            />
            {/* WATCH */}
            <RoadmapRow
              phase="WATCH" color="var(--text-muted)"
              items={[
                { title: 'Object-level tracking (TAO)', desc: 'Pixel-level bounding boxes with persistent cross-frame tracking', papers: ['TAO Framework'] },
                { title: 'Intent recognition (LAS-VAD)', desc: 'Action sequence grouping to distinguish normal vs. anomalous intent', papers: ['LAS-VAD'] },
                { title: 'Neuromorphic chips', desc: 'Spiking Neural Networks for sub-10ms latency at 5W power', papers: [] },
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Sub-components ── */

function Phase({ label, color, description }: { label: string; color: string; description: string }) {
  return (
    <div className="flex items-center gap-2 flex-1">
      <span className="badge" style={{
        background: `${color}20`, color, border: `1px solid ${color}33`,
        fontSize: 10, padding: '2px 8px', fontWeight: 700,
      }}>
        {label}
      </span>
      <span className="text-xs text-muted">{description}</span>
    </div>
  );
}

function RoadmapRow({ phase, color, items }: { phase: string; color: string; items: { title: string; desc: string; papers: string[] }[] }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        width: 4, height: 4, borderRadius: '50%', background: color,
        marginLeft: 10, marginBottom: 4,
      }} />
      <div className="flex-col gap-2" style={{
        borderLeft: `2px solid ${color}44`, marginLeft: 11, paddingLeft: 20,
      }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: '10px 14px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
          }}>
            <div className="flex items-center gap-2">
              <ArrowRight size={12} color={color} />
              <span className="text-sm font-semibold">{item.title}</span>
            </div>
            <div className="text-xs text-secondary" style={{ marginTop: 3, lineHeight: 1.5 }}>{item.desc}</div>
            {item.papers.length > 0 && (
              <div className="flex gap-1 items-center" style={{ marginTop: 4 }}>
                <BookOpen size={10} color="var(--text-muted)" />
                {item.papers.map(p => (
                  <span key={p} className="badge badge-neutral" style={{ fontSize: 8 }}>{p}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

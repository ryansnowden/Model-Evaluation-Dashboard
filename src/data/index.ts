import {
  IncidentTrace,
  BenchmarkSlice,
  ModelConfig,
  GateRequirement,
  DataCoverage,
} from '../types';

// ── Helpers ──
const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
const rndInt = (min: number, max: number) => Math.floor(rnd(min, max + 1));
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ── 1. Model Configurations ──
export const mockModels: ModelConfig[] = [
  {
    run_id: 'run-baseline',
    name: 'Baseline (Frame-level)',
    short_name: 'Baseline',
    description: 'Initial frame-level anomaly detection',
    status: 'completed',
    dataset: 'full-suite-v1',
    color: '#64748b',
    is_candidate: false,
    pr_auc: 0.72, f1_score: 0.68, tiou: 0.42, far_per_100h: 14.2,
    confirmation_rate: 0.61, precision: 0.70, recall: 0.65,
  },
  {
    run_id: 'run-a1',
    name: 'A1: Memory-guided',
    short_name: 'A1',
    description: 'Added memory bank for context',
    status: 'completed',
    dataset: 'full-suite-v1',
    color: '#06b6d4',
    is_candidate: false,
    pr_auc: 0.78, f1_score: 0.74, tiou: 0.55, far_per_100h: 12.8,
    confirmation_rate: 0.65, precision: 0.76, recall: 0.72,
  },
  {
    run_id: 'run-a2',
    name: 'A2: Temporal Smoothing',
    short_name: 'A2',
    description: 'Added 1D temporal convolution',
    status: 'completed',
    dataset: 'full-suite-v1',
    color: '#8b5cf6',
    is_candidate: false,
    pr_auc: 0.82, f1_score: 0.79, tiou: 0.64, far_per_100h: 11.1,
    confirmation_rate: 0.71, precision: 0.82, recall: 0.76,
  },
  {
    run_id: 'run-a3',
    name: 'A3: Event Persistence',
    short_name: 'A3',
    description: 'Hysteresis thresholding',
    status: 'completed',
    dataset: 'full-suite-v1',
    color: '#f59e0b',
    is_candidate: false,
    pr_auc: 0.85, f1_score: 0.83, tiou: 0.71, far_per_100h: 9.4,
    confirmation_rate: 0.76, precision: 0.86, recall: 0.80,
  },
  {
    run_id: 'run-a4',
    name: 'A4: Full Stack (Candidate)',
    short_name: 'A4',
    description: 'All improvements combined',
    status: 'completed',
    dataset: 'full-suite-v1',
    color: '#10b981',
    is_candidate: true,
    pr_auc: 0.89, f1_score: 0.87, tiou: 0.78, far_per_100h: 6.8,
    confirmation_rate: 0.84, precision: 0.91, recall: 0.85,
  },
];

// ── 2. Benchmark Slices ──
export const mockSlices: BenchmarkSlice[] = [
  { slice_id: 'slice-atrium-peak', name: 'atrium-pedestrian-zone-peak-hours', purpose: 'Track A: High density pedestrian tracking', track: 'A', num_cameras: 4, hours_of_video: 120, total_events: 45 },
  { slice_id: 'slice-corridor-night', name: 'service-corridor-late-night', purpose: 'Track B: Rare event detection in static scenes', track: 'B', num_cameras: 6, hours_of_video: 180, total_events: 62 },
  { slice_id: 'slice-parking-weekend', name: 'parking-structure-weekend', purpose: 'Generalization to variable lighting', track: 'General', num_cameras: 12, hours_of_video: 240, total_events: 85 },
  { slice_id: 'slice-loading-dock', name: 'loading-dock-active', purpose: 'Heavy vehicle interaction', track: 'General', num_cameras: 3, hours_of_video: 60, total_events: 30 },
  { slice_id: 'slice-periphery', name: 'periphery-fence-line', purpose: 'Long range detection', track: 'General', num_cameras: 8, hours_of_video: 400, total_events: 28 },
];

// ── 3. Gates ──
export const mockGates: GateRequirement[] = [
  { id: 'gate-1', name: 'Track A Localisation', track: 'Track A', requirement: 'tIoU ≥ 0.75 on peak hours', threshold: '≥ 0.75', actual_value: '0.78', status: 'pass', evidence: 'tIoU is 0.78 on A4 across atrium-peak slice', reviewer: 'J. Chen', review_status: 'approved' },
  { id: 'gate-2', name: 'Track B Burden Reduction', track: 'Track B', requirement: 'FAR < 8.0 per 100h', threshold: '< 8.0', actual_value: '6.8', status: 'pass', evidence: 'FAR is 6.8 on A4 across corridor-night slice', reviewer: 'M. Patel', review_status: 'approved' },
  { id: 'gate-3', name: 'Generalization Hold-out', track: 'Holdout', requirement: 'No F1 regression on periphery', threshold: '≥ 0.81', actual_value: '0.80', status: 'warning', evidence: 'Slight F1 regression (0.81 → 0.80) on periphery-fence-line', reviewer: 'S. Kim', review_status: 'pending' },
  { id: 'gate-4', name: 'Latency SLA', track: 'Infra', requirement: 'P99 latency < 500ms', threshold: '< 500ms', actual_value: '320ms', status: 'pass', evidence: 'P99 measured at 320ms over 7-day window', reviewer: 'A. Rodriguez', review_status: 'approved' },
  { id: 'gate-5', name: 'Confirmation Rate', track: 'Ops', requirement: 'Operator confirm rate ≥ 0.75', threshold: '≥ 0.75', actual_value: '0.84', status: 'pass', evidence: '84% of escalated alerts confirmed by operators', reviewer: 'J. Chen', review_status: 'approved' },
];

// ── 4. Data Coverage ──
export const mockCoverage: DataCoverage = {
  total_traces: 250,
  labelled: 220,
  reviewed: 195,
  approved: 180,
};

// ── 5. Traces ──
const cameras = ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05', 'CAM-06'];
const zoneTypes = ['Atrium', 'Corridor', 'Parking', 'Loading Dock', 'Perimeter'];
const timeBands = ['Morning Rush', 'Midday', 'Evening Rush', 'Late Night'];
const scenarioLabels = ['loitering', 'tailgating', 'abandoned_object', 'unauthorized_access', 'slip_and_fall'];
const runIds = mockModels.map(m => m.run_id);

// Detection probabilities per model (later models are better)
const detectionProb: Record<string, { actionable: number; benign: number }> = {
  'run-baseline': { actionable: 0.65, benign: 0.30 },
  'run-a1': { actionable: 0.72, benign: 0.22 },
  'run-a2': { actionable: 0.79, benign: 0.16 },
  'run-a3': { actionable: 0.83, benign: 0.11 },
  'run-a4': { actionable: 0.88, benign: 0.07 },
};

export const mockTraces: IncidentTrace[] = Array.from({ length: 250 }).map((_, i) => {
  const anomalyScore = rnd(0.15, 0.99);
  const hue = Math.floor((1 - anomalyScore) * 120);
  const thumbnailColor = `hsl(${hue}, 70%, 45%)`;

  // Ground truth distribution: ~40% actionable, ~45% benign, ~15% unclear
  const gtRoll = Math.random();
  const gt: 'actionable' | 'benign' | 'unclear' =
    gtRoll < 0.40 ? 'actionable' :
    gtRoll < 0.85 ? 'benign' : 'unclear';

  // Tags based on ground truth and score
  const tags: string[] = [];
  if (anomalyScore > 0.6 && gt === 'actionable') tags.push('true_positive');
  if (anomalyScore > 0.6 && gt === 'benign') tags.push('false_positive');
  if (anomalyScore <= 0.6 && gt === 'actionable') tags.push('false_negative');
  if (anomalyScore <= 0.6 && gt === 'benign') tags.push('true_negative');

  // Per-model metrics with progressive improvement
  const metrics: Record<string, { precision: number; recall: number; f1_score: number; tiou: number; confidence: number }> = {};
  const modelDetections: Record<string, boolean> = {};

  runIds.forEach((runId, idx) => {
    const improvement = idx * 0.04;
    metrics[runId] = {
      precision: Math.min(1, rnd(0.55, 0.75) + improvement),
      recall: Math.min(1, rnd(0.50, 0.70) + improvement),
      f1_score: Math.min(1, rnd(0.50, 0.70) + improvement),
      tiou: Math.min(1, rnd(0.25, 0.55) + improvement * 2),
      confidence: Math.min(1, anomalyScore * rnd(0.85, 1.15)),
    };

    // Does this model detect this trace as anomalous?
    const prob = gt === 'actionable'
      ? detectionProb[runId].actionable
      : gt === 'benign'
        ? detectionProb[runId].benign
        : 0.40;
    modelDetections[runId] = Math.random() < prob;
  });

  // Raw and smoothed scores
  const raw = Array.from({ length: 60 }).map(() => rnd(0, 1));
  const smooth = raw.map(v => v * 0.7 + anomalyScore * 0.3);

  return {
    trace_id: `TRC-${(1000 + i)}`,
    camera_id: pick(cameras),
    zone_type: pick(zoneTypes),
    slice_id: pick(mockSlices).slice_id,
    timestamp: new Date(Date.now() - rndInt(0, 30) * 86400000).toISOString(),
    time_band: pick(timeBands),
    day_type: pick(['weekday', 'weekend']) as 'weekday' | 'weekend',
    scenario_label: pick(scenarioLabels),
    ground_truth: gt,
    spans: [
      { id: 's1', name: 'Frame Decode', start_time_ms: 0, duration_ms: rndInt(8, 18), status: 'ok' as const },
      { id: 's2', name: 'Object Detection', start_time_ms: 15, duration_ms: rndInt(30, 60), status: 'ok' as const },
      { id: 's3', name: 'Feature Extraction', start_time_ms: 65, duration_ms: rndInt(20, 45), status: 'ok' as const },
      { id: 's4', name: 'Temporal Model', start_time_ms: 100, duration_ms: rndInt(80, 160), status: 'ok' as const },
    ],
    anomaly_score: anomalyScore,
    score_raw: raw,
    score_smooth: smooth,
    threshold: 0.6,
    event_candidates: [{ start_sec: rndInt(5, 15), end_sec: rndInt(16, 25), max_score: anomalyScore }],
    priority: pick(['informational', 'low', 'medium', 'high', 'critical']) as any,
    operator_action: pick(['confirmed', 'dismissed', 'ignored', 'escalated_further']) as any,
    review_time_sec: rndInt(5, 120),
    metrics,
    model_detections: modelDetections,
    tags,
    thumbnail_color: thumbnailColor,
    annotation_status: pick(['labelled', 'reviewed', 'approved', 'approved']) as any,
  };
});

// ── 6. Per-model confusion matrix aggregates ──
export function computeConfusion(traces: IncidentTrace[], runId: string) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  traces.forEach(t => {
    const detected = t.model_detections[runId] ?? false;
    const isActionable = t.ground_truth === 'actionable';
    const isBenign = t.ground_truth === 'benign';

    if (detected && isActionable) tp++;
    if (detected && isBenign) fp++;
    if (!detected && isActionable) fn++;
    if (!detected && isBenign) tn++;
  });
  return { tp, fp, fn, tn };
}

// ── 7. Per-model F1 by zone ──
export function computeF1ByZone(traces: IncidentTrace[], runId: string) {
  const zones = Array.from(new Set(traces.map(t => t.zone_type)));
  return zones.map(zone => {
    const zoneTraces = traces.filter(t => t.zone_type === zone);
    const { tp, fp, fn } = computeConfusion(zoneTraces, runId);
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
    return { zone, f1, tp, fp, fn, total: zoneTraces.length };
  });
}

// ── 8. Per-model F1 by time band ──
export function computeF1ByTimeBand(traces: IncidentTrace[], runId: string) {
  const bands = Array.from(new Set(traces.map(t => t.time_band)));
  return bands.map(band => {
    const bandTraces = traces.filter(t => t.time_band === band);
    const { tp, fp, fn } = computeConfusion(bandTraces, runId);
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
    return { band, f1, tp, fp, fn, total: bandTraces.length };
  });
}

// ── 9. Per-model F1 by scenario ──
export function computeF1ByScenario(traces: IncidentTrace[], runId: string) {
  const scenarios = Array.from(new Set(traces.map(t => t.scenario_label)));
  return scenarios.map(scenario => {
    const scenTraces = traces.filter(t => t.scenario_label === scenario);
    const { tp, fp, fn } = computeConfusion(scenTraces, runId);
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
    return { scenario, f1, tp, fp, fn, total: scenTraces.length };
  });
}

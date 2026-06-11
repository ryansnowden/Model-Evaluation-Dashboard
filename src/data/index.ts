import {
  IncidentTrace,
  BenchmarkSlice,
  AblationRun,
  GateRequirement,
  EvaluationScenario
} from '../types';

// Helper to generate random numbers
const rnd = (min: number, max: number) => Math.random() * (max - min) + min;
const rndInt = (min: number, max: number) => Math.floor(rnd(min, max + 1));
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// 1. Benchmark Slices
export const mockSlices: BenchmarkSlice[] = [
  { slice_id: 'slice-atrium-peak', name: 'atrium-pedestrian-zone-peak-hours', purpose: 'Track A eval: High density pedestrian tracking', track: 'A', num_cameras: 4, hours_of_video: 120, total_events: 45 },
  { slice_id: 'slice-corridor-night', name: 'service-corridor-late-night', purpose: 'Track B eval: Rare event detection in static scenes', track: 'B', num_cameras: 6, hours_of_video: 180, total_events: 62 },
  { slice_id: 'slice-parking-weekend', name: 'parking-structure-weekend', purpose: 'Generalization to variable lighting', track: 'General', num_cameras: 12, hours_of_video: 240, total_events: 85 },
  { slice_id: 'slice-loading-dock', name: 'loading-dock-active', purpose: 'Heavy vehicle interaction', track: 'General', num_cameras: 3, hours_of_video: 60, total_events: 30 },
  { slice_id: 'slice-periphery', name: 'periphery-fence-line', purpose: 'Long range detection', track: 'General', num_cameras: 8, hours_of_video: 400, total_events: 28 }
];

// 2. Ablation Runs
export const mockRuns: AblationRun[] = [
  { run_id: 'run-baseline', name: 'Baseline (Frame-level)', description: 'Initial frame-level anomaly detection', status: 'completed', dataset: 'full-suite-v1', pr_auc: 0.72, f1_score: 0.68, tiou: 0.42, far_per_100h: 14.2, confirmation_rate: 0.61 },
  { run_id: 'run-a1', name: 'A1: Memory-guided', description: 'Added memory bank for context', status: 'completed', dataset: 'full-suite-v1', pr_auc: 0.78, f1_score: 0.74, tiou: 0.55, far_per_100h: 12.8, confirmation_rate: 0.65 },
  { run_id: 'run-a2', name: 'A2: Temporal Smoothing', description: 'Added 1D temporal convolution', status: 'completed', dataset: 'full-suite-v1', pr_auc: 0.82, f1_score: 0.79, tiou: 0.64, far_per_100h: 11.1, confirmation_rate: 0.71 },
  { run_id: 'run-a3', name: 'A3: Event Persistence', description: 'Hysteresis thresholding', status: 'completed', dataset: 'full-suite-v1', pr_auc: 0.85, f1_score: 0.83, tiou: 0.71, far_per_100h: 9.4, confirmation_rate: 0.76 },
  { run_id: 'run-a4', name: 'A4: Full Stack (Candidate)', description: 'All improvements combined', status: 'completed', dataset: 'full-suite-v1', pr_auc: 0.89, f1_score: 0.87, tiou: 0.78, far_per_100h: 6.8, confirmation_rate: 0.84 }
];

// 3. Gates
export const mockGates: GateRequirement[] = [
  { id: 'gate-1', name: 'Track A Localisation', track: 'A', requirement: 'tIoU >= 0.75 on peak hours', status: 'pass', evidence: 'tIoU is 0.78 on A4', review_status: 'approved' },
  { id: 'gate-2', name: 'Track B Burden Reduction', track: 'B', requirement: 'FAR < 8.0 per 100h', status: 'pass', evidence: 'FAR is 6.8 on A4', review_status: 'reviewed' },
  { id: 'gate-3', name: 'Generalization', track: 'Holdout', requirement: 'No regression on periphery', status: 'warning', evidence: 'Slight regression in F1 (0.81 -> 0.80)', review_status: 'in_review' },
  { id: 'gate-4', name: 'Latency SLA', track: 'General', requirement: 'P99 Latency < 500ms', status: 'pass', evidence: 'P99 is 320ms', review_status: 'approved' }
];

// 4. Traces
const cameras = ['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05', 'CAM-06'];
const zoneTypes = ['Atrium', 'Corridor', 'Parking', 'Loading Dock', 'Perimeter'];
const timeBands = ['Morning Rush', 'Midday', 'Evening Rush', 'Late Night'];
const scenarioLabels = ['loitering', 'tailgating', 'abandoned_object', 'unauthorized_access', 'slip_and_fall'];
const runs = mockRuns.map(r => r.run_id);

export const mockTraces: IncidentTrace[] = Array.from({ length: 250 }).map((_, i) => {
  const anomalyScore = rnd(0.2, 0.99);
  
  // Calculate mock colors based on score (FiftyOne style)
  const hue = Math.floor((1 - anomalyScore) * 120); // 0 = red, 120 = green
  const thumbnailColor = "hsl(" + hue + ", 80%, 50%)";
  
  const gt = anomalyScore > 0.6 ? pick(['actionable', 'actionable', 'benign']) : pick(['benign', 'benign', 'unclear']);
  const tags = [];
  if (anomalyScore > 0.6 && gt === 'actionable') tags.push('true_positive');
  if (anomalyScore > 0.6 && gt === 'benign') tags.push('false_positive');
  if (anomalyScore <= 0.6 && gt === 'actionable') tags.push('false_negative');
  if (anomalyScore <= 0.6 && gt === 'benign') tags.push('true_negative');

  const metrics: Record<string, any> = {};
  runs.forEach(runId => {
    // Generate some variance per run
    metrics[runId] = {
      precision: rnd(0.5, 1.0),
      recall: rnd(0.5, 1.0),
      f1_score: rnd(0.5, 1.0),
      tiou: rnd(0.2, 0.9),
      confidence: anomalyScore * rnd(0.9, 1.1)
    };
  });

  // Mock raw and smooth scores
  const raw = Array.from({length: 60}).map(() => rnd(0, 1));
  const smooth = raw.map(v => v * 0.8 + anomalyScore * 0.2); // Simple mock

  return {
    trace_id: "TRC-" + (1000 + i),
    camera_id: pick(cameras),
    zone_type: pick(zoneTypes),
    slice_id: pick(mockSlices).slice_id,
    timestamp: new Date(Date.now() - rndInt(0, 30) * 86400000).toISOString(),
    time_band: pick(timeBands),
    day_type: pick(['weekday', 'weekend']),
    scenario_label: pick(scenarioLabels),
    ground_truth: gt as any,
    spans: [
      { id: 's1', name: 'Frame Decode', start_time_ms: 0, duration_ms: 12, status: 'ok' },
      { id: 's2', name: 'Object Detection', start_time_ms: 12, duration_ms: 45, status: 'ok' },
      { id: 's3', name: 'Feature Extraction', start_time_ms: 57, duration_ms: 30, status: 'ok' },
      { id: 's4', name: 'Temporal Model', start_time_ms: 87, duration_ms: 120, status: 'ok' }
    ],
    anomaly_score: anomalyScore,
    score_raw: raw,
    score_smooth: smooth,
    threshold: 0.6,
    event_candidates: [ { start_sec: 10, end_sec: 15, max_score: anomalyScore } ],
    priority: pick(['informational', 'low', 'medium', 'high', 'critical']) as any,
    operator_action: pick(['confirmed', 'dismissed', 'ignored', 'escalated_further']) as any,
    review_time_sec: rndInt(5, 120),
    metrics,
    tags,
    thumbnail_color: thumbnailColor,
    annotation_status: pick(['labelled', 'reviewed', 'approved', 'approved']) as any
  };
});

// 5. Scenario Analysis
export const mockScenarios: EvaluationScenario[] = [
  {
    scenario_id: 'scen-zone',
    name: 'Performance by Zone Type',
    dimension: 'zone_type',
    subsets: zoneTypes.map(z => ({
      subset_value: z,
      metrics: { precision: rnd(0.6, 0.95), recall: rnd(0.6, 0.95), f1_score: rnd(0.6, 0.95), tiou: rnd(0.5, 0.8), confidence: rnd(0.7, 0.9) },
      tp: rndInt(10, 50), fp: rndInt(5, 20), fn: rndInt(2, 15)
    }))
  },
  {
    scenario_id: 'scen-time',
    name: 'Performance by Time Band',
    dimension: 'time_band',
    subsets: timeBands.map(t => ({
      subset_value: t,
      metrics: { precision: rnd(0.6, 0.95), recall: rnd(0.6, 0.95), f1_score: rnd(0.6, 0.95), tiou: rnd(0.5, 0.8), confidence: rnd(0.7, 0.9) },
      tp: rndInt(10, 50), fp: rndInt(5, 20), fn: rndInt(2, 15)
    }))
  }
];

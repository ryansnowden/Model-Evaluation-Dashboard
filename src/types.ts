export type AlertPriority = 'informational' | 'low' | 'medium' | 'high' | 'critical';
export type GroundTruthLabel = 'benign' | 'actionable' | 'unclear';
export type OperatorAction = 'confirmed' | 'dismissed' | 'ignored' | 'escalated_further';
export type AnnotationStatus = 'unlabelled' | 'labelled' | 'reviewed' | 'approved';
export type DayType = 'weekday' | 'weekend';

export interface PipelineSpan {
  id: string;
  name: string;
  start_time_ms: number;
  duration_ms: number;
  status: 'ok' | 'error';
  children?: PipelineSpan[];
}

export interface EventWindow {
  start_sec: number;
  end_sec: number;
  max_score: number;
}

export interface TraceMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  tiou: number;
  confidence: number; // For average confidence
}

export interface IncidentTrace {
  trace_id: string;
  camera_id: string;
  zone_type: string;
  slice_id: string; // References a benchmark slice
  timestamp: string; // ISO string
  time_band: string; // e.g., 'morning_rush', 'late_night'
  day_type: DayType;
  scenario_label: string; // e.g., 'abandoned_object', 'loitering', 'tailgating'
  ground_truth: GroundTruthLabel;
  
  // Pipeline spans
  spans: PipelineSpan[];
  
  // Detector outputs
  anomaly_score: number;
  score_raw: number[];      // For timeline
  score_smooth: number[];   // For timeline
  threshold: number;        // Active threshold at the time
  event_candidates: EventWindow[];
  
  // Triage
  priority: AlertPriority;
  
  // Operator
  operator_action: OperatorAction;
  review_time_sec: number;
  
  // Evaluation (per ablation config)
  // key: config_id (e.g., 'baseline', 'a1', 'a2')
  metrics: Record<string, TraceMetrics>;
  
  // FiftyOne-style fields
  tags: string[];        // e.g. ['true_positive', 'track_a', 'reviewed']
  thumbnail_color: string; // Computed from anomaly_score (for the clip grid)
  annotation_status: AnnotationStatus;
}

export interface BenchmarkSlice {
  slice_id: string;
  name: string;
  purpose: string;
  track: 'A' | 'B' | 'General';
  num_cameras: number;
  hours_of_video: number;
  total_events: number;
}

export interface AblationRun {
  run_id: string;
  name: string;
  description: string;
  status: 'completed' | 'running' | 'failed';
  dataset: string;
  pr_auc: number;
  f1_score: number;
  tiou: number;
  far_per_100h: number;
  confirmation_rate: number;
}

export interface GateRequirement {
  id: string;
  name: string;
  track: 'A' | 'B' | 'Holdout';
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  evidence: string;
  review_status: 'in_review' | 'reviewed' | 'changes_requested' | 'approved';
}

// Scenario analysis definition (FiftyOne style)
export interface ScenarioSubset {
  subset_value: string; // e.g. 'indoor', 'outdoor'
  metrics: TraceMetrics;
  tp: number;
  fp: number;
  fn: number;
}

export interface EvaluationScenario {
  scenario_id: string;
  name: string;
  dimension: 'zone_type' | 'time_band' | 'day_type' | 'scenario_label';
  subsets: ScenarioSubset[];
}

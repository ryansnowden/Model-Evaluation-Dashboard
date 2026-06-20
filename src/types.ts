export type AlertPriority = 'informational' | 'low' | 'medium' | 'high' | 'critical';
export type GroundTruthLabel = 'benign' | 'actionable' | 'unclear';
export type OperatorAction = 'confirmed' | 'dismissed' | 'ignored' | 'escalated_further';
export type AnnotationStatus = 'unlabelled' | 'labelled' | 'reviewed' | 'approved';
export type DayType = 'weekday' | 'weekend';
export type GateStatus = 'pass' | 'fail' | 'warning';

export interface PipelineSpan {
  id: string;
  name: string;
  start_time_ms: number;
  duration_ms: number;
  status: 'ok' | 'error';
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
  confidence: number;
}

export interface IncidentTrace {
  trace_id: string;
  camera_id: string;
  zone_type: string;
  slice_id: string;
  timestamp: string;
  time_band: string;
  day_type: DayType;
  scenario_label: string;
  ground_truth: GroundTruthLabel;

  // Pipeline spans
  spans: PipelineSpan[];

  // Detector outputs
  anomaly_score: number;
  score_raw: number[];
  score_smooth: number[];
  threshold: number;
  event_candidates: EventWindow[];

  // Triage
  priority: AlertPriority;
  operator_action: OperatorAction;
  review_time_sec: number;

  // Per-model metrics: key = run_id
  metrics: Record<string, TraceMetrics>;

  // Per-model detection: did this model catch the anomaly?
  model_detections: Record<string, boolean>;

  // Tags and metadata
  tags: string[];
  thumbnail_color: string;
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

export interface ModelConfig {
  run_id: string;
  name: string;
  short_name: string;
  description: string;
  status: 'completed' | 'running' | 'failed';
  dataset: string;
  color: string;
  is_candidate: boolean;
  // Aggregate metrics
  pr_auc: number;
  f1_score: number;
  tiou: number;
  far_per_100h: number;
  confirmation_rate: number;
  precision: number;
  recall: number;
}

export interface GateRequirement {
  id: string;
  name: string;
  track: string;
  requirement: string;
  threshold: string;
  actual_value: string;
  status: GateStatus;
  evidence: string;
  reviewer: string;
  review_status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

export interface ScenarioSubset {
  subset_value: string;
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

export interface DataCoverage {
  total_traces: number;
  labelled: number;
  reviewed: number;
  approved: number;
}

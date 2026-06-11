export interface ClipData {
  clip_id: string;
  site_name: string;
  city: string;
  country: string;
  camera_id: string;
  zone_type: string;
  timestamp_start: string;
  local_time_band: string;
  day_type: 'weekday' | 'weekend';
  scenario_label: string;
  ground_truth: 'benign' | 'actionable' | 'unclear';
  operator_outcome: 'dismissed' | 'confirmed' | 'escalated';
  
  // Model V1
  anomaly_score_v1: number;
  threshold_v1: number;
  alerted_v1: 'yes' | 'no';
  triage_decision_v1: 'escalated' | 'filtered' | '';
  triage_reason_v1: string;
  time_to_alert_sec_v1: number | null; // null if not alerted or empty
  
  // Model V2
  anomaly_score_v2: number;
  threshold_v2: number;
  alerted_v2: 'yes' | 'no';
  triage_decision_v2: 'escalated' | 'filtered' | '';
  triage_reason_v2: string;
  time_to_alert_sec_v2: number | null;

  // Model V3 (Edge Optimized)
  anomaly_score_v3: number;
  threshold_v3: number;
  alerted_v3: 'yes' | 'no';
  triage_decision_v3: 'escalated' | 'filtered' | '';
  triage_reason_v3: string;
  time_to_alert_sec_v3: number | null;
  
  false_positive_reason: string;
  slice_tags: string[];
  ship_blocker: 'yes' | 'no';
  
  // Hardcoded Confusion Matrix indicators
  tp_v1: number;
  fp_v1: number;
  fn_v1: number;
  tn_v1: number;
  
  tp_v2: number;
  fp_v2: number;
  fn_v2: number;
  tn_v2: number;

  tp_v3: number;
  fp_v3: number;
  fn_v3: number;
  tn_v3: number;
}

export interface MetricSummary {
  precision: number;
  recall: number;
  accuracy: number;
  f1: number;
  fpr: number; // False Positive Rate
  fnr: number; // False Negative Rate
  tp: number;
  fp: number;
  fn: number;
  tn: number;
  total: number;
}

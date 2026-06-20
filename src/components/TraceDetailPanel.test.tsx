import React from 'react';
import { render, screen } from '@testing-library/react';
import TraceDetailPanel from './TraceDetailPanel';
import { IncidentTrace, ModelConfig } from '../types';

const mockTrace: IncidentTrace = {
  trace_id: 'tr_123',
  camera_id: 'cam_1',
  zone_type: 'retail',
  time_band: 'day',
  ground_truth: 'Positive',
  scenario_label: 'test_scenario',
  day_type: 'weekday',
  priority: 'High',
  tags: ['true_positive'],
  threshold: 0.5,
  anomaly_score: 0.9,
  score_raw: [0.1, 0.2, 0.8],
  score_smooth: [0.1, 0.15, 0.85],
  spans: [],
  model_detections: {},
  metrics: {},
  operator_action: 'review',
  review_time_sec: 10,
  annotation_status: 'done'
};

const mockModels: ModelConfig[] = [];

describe('TraceDetailPanel', () => {
  it('should render the timeline correlation view for audio frames', () => {
    render(
      <TraceDetailPanel 
        trace={mockTrace} 
        models={mockModels} 
        onClose={() => {}} 
      />
    );
    
    // We expect an enhanced timeline structure indicating audio frame correlation
    expect(screen.getByTestId('timeline-correlation')).toBeInTheDocument();
  });
});

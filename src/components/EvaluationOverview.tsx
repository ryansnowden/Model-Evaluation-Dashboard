import React, { useState } from 'react';
import { BarChart3, AlertTriangle, Rocket, Database } from 'lucide-react';
import { mockTraces, mockModels, mockGates, mockCoverage } from '../data/index';
import { IncidentTrace } from '../types';
import ModelComparisonStrip from './ModelComparisonStrip';
import FailureAnalysis from './FailureAnalysis';
import DeploymentGates from './DeploymentGates';
import TraceEvidence from './TraceEvidence';
import TraceDetailPanel from './TraceDetailPanel';

export default function EvaluationOverview() {
  const [selectedModels, setSelectedModels] = useState<string[]>(
    mockModels.map(m => m.run_id) // all selected by default
  );
  const [selectedTrace, setSelectedTrace] = useState<IncidentTrace | null>(null);

  const handleToggleModel = (runId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(runId)) {
        // Don't allow deselecting the last model
        if (prev.length <= 1) return prev;
        return prev.filter(id => id !== runId);
      }
      return [...prev, runId];
    });
  };

  return (
    <>
      <div className="flex-col gap-8" style={{ paddingBottom: 40 }}>
        {/* Section A: Model Comparison */}
        <section id="model-comparison">
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={16} color="var(--accent)" />
                <h2 className="section-title">Model Performance Comparison</h2>
              </div>
              <p className="section-subtitle">Compare metrics across all model iterations — best-in-class values highlighted in green.</p>
            </div>
          </div>
          <ModelComparisonStrip
            models={mockModels}
            selectedModels={selectedModels}
            onToggleModel={handleToggleModel}
          />
        </section>

        {/* Section B: Error Analysis */}
        <section id="error-analysis">
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} color="var(--color-warn)" />
                <h2 className="section-title">Error Analysis & Failure Modes</h2>
              </div>
              <p className="section-subtitle">Diagnose where and when models underperform — broken down by error type, zone, time, and scenario.</p>
            </div>
          </div>
          <FailureAnalysis
            traces={mockTraces}
            models={mockModels}
            selectedModels={selectedModels}
          />
        </section>

        {/* Section C: Deployment Gates */}
        <section id="deployment-gates">
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
                <Rocket size={16} color="var(--color-pass)" />
                <h2 className="section-title">Production Readiness Gates</h2>
              </div>
              <p className="section-subtitle">Automated ship/no-ship verdict — every gate must pass before the candidate model goes live.</p>
            </div>
          </div>
          <DeploymentGates
            gates={mockGates}
            coverage={mockCoverage}
          />
        </section>

        {/* Section D: Anomaly Evidence */}
        <section id="anomaly-evidence">
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
                <Database size={16} color="var(--accent)" />
                <h2 className="section-title">Trace-Level Evidence</h2>
              </div>
              <p className="section-subtitle">Drill into individual traces to inspect model agreement, scores, and operator decisions.</p>
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <TraceEvidence
              traces={mockTraces}
              models={mockModels}
              selectedModels={selectedModels}
              onSelectTrace={setSelectedTrace}
              selectedTraceId={selectedTrace?.trace_id ?? null}
            />
          </div>
        </section>
      </div>

      {/* Trace Detail Slide-in */}
      {selectedTrace && (
        <TraceDetailPanel
          trace={selectedTrace}
          models={mockModels.filter(m => selectedModels.includes(m.run_id))}
          onClose={() => setSelectedTrace(null)}
        />
      )}
    </>
  );
}

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
        <section>
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={16} color="var(--accent)" />
                <h2 className="section-title">Model Comparison</h2>
              </div>
              <p className="section-subtitle">Select models to compare. Winner highlighted per metric.</p>
            </div>
          </div>
          <ModelComparisonStrip
            models={mockModels}
            selectedModels={selectedModels}
            onToggleModel={handleToggleModel}
          />
        </section>

        {/* Section B: Where It Fails */}
        <section>
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} color="var(--color-warn)" />
                <h2 className="section-title">Where It Fails</h2>
              </div>
              <p className="section-subtitle">Confusion matrices, zone × time performance heatmap, and F1 by scenario.</p>
            </div>
          </div>
          <FailureAnalysis
            traces={mockTraces}
            models={mockModels}
            selectedModels={selectedModels}
          />
        </section>

        {/* Section C: Deployment Gates */}
        <section>
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
                <Rocket size={16} color="var(--color-pass)" />
                <h2 className="section-title">Deployment Gates</h2>
              </div>
              <p className="section-subtitle">Ship/no-ship decision with gate checklist and data coverage.</p>
            </div>
          </div>
          <DeploymentGates
            gates={mockGates}
            coverage={mockCoverage}
          />
        </section>

        {/* Section D: Anomaly Evidence */}
        <section>
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
                <Database size={16} color="var(--accent)" />
                <h2 className="section-title">Anomaly Evidence</h2>
              </div>
              <p className="section-subtitle">Click any trace to inspect per-model scores, pipeline, and triage.</p>
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

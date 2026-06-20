import React, { useState } from 'react';
import { BarChart3, AlertTriangle, Rocket, Database } from 'lucide-react';
import { mockTraces, mockModels, mockGates, mockCoverage } from '../data/index';
import { IncidentTrace, GateRequirement } from '../types';
import ModelComparisonStrip from './ModelComparisonStrip';
import FailureAnalysis from './FailureAnalysis';
import DeploymentGates from './DeploymentGates';
import TraceEvidence from './TraceEvidence';
import TraceDetailPanel from './TraceDetailPanel';
import GateDetailPanel from './GateDetailPanel';
import KPIRibbon from './KPIRibbon';

export default function EvaluationOverview() {
  const [liveTraces, setLiveTraces] = useState<IncidentTrace[]>(mockTraces);
  
  // Simulate live data ingestion
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveTraces(prev => {
        const randomTrace = prev[Math.floor(Math.random() * prev.length)];
        const newTrace = {
          ...randomTrace,
          trace_id: `tr_${Math.random().toString(36).substring(2, 9)}`,
          timestamp: new Date().toISOString(),
        };
        return [newTrace, ...prev];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [selectedModels, setSelectedModels] = useState<string[]>(
    mockModels.map(m => m.run_id) // all selected by default
  );
  const [selectedTrace, setSelectedTrace] = useState<IncidentTrace | null>(null);
  const [globalFilter, setGlobalFilter] = useState<{ zone?: string; timeBand?: string; scenario?: string; tags?: string[] }>({});

  const filteredTraces = React.useMemo(() => {
    return liveTraces.filter(t => {
      if (globalFilter.zone && t.zone_type !== globalFilter.zone) return false;
      if (globalFilter.timeBand && t.time_band !== globalFilter.timeBand) return false;
      if (globalFilter.scenario && t.scenario_label !== globalFilter.scenario) return false;
      if (globalFilter.tags && globalFilter.tags.length > 0) {
        if (!globalFilter.tags.some(tag => t.tags.includes(tag))) return false;
      }
      return true;
    });
  }, [globalFilter]);
  
  const [gates, setGates] = useState<GateRequirement[]>(() => {
    const saved = localStorage.getItem('vad-gates-review');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved gates:', e);
      }
    }
    return mockGates;
  });
  const [selectedGate, setSelectedGate] = useState<GateRequirement | null>(null);

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

  const handleSaveGate = (gateId: string, reviewStatus: 'pending' | 'approved' | 'rejected', comment: string) => {
    setGates(prevGates => {
      const nextGates = prevGates.map(gate => {
        if (gate.id === gateId) {
          return {
            ...gate,
            review_status: reviewStatus,
            comment: comment || undefined
          };
        }
        return gate;
      });
      localStorage.setItem('vad-gates-review', JSON.stringify(nextGates));
      setSelectedGate(null);
      return nextGates;
    });
  };

  return (
    <>
      {/* KPI Ribbon (Hero Metrics) */}
      <KPIRibbon traces={liveTraces} models={mockModels} gates={gates} />

      <div className="dashboard-grid" style={{ paddingBottom: 40 }}>
        {/* Section A: Model Comparison */}
        <section id="model-comparison">
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
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
                <h2 className="section-title">Error Analysis & Failure Modes</h2>
              </div>
              <p className="section-subtitle">Diagnose where and when models underperform — broken down by error type, zone, time, and scenario.</p>
            </div>
          </div>
          <FailureAnalysis
            traces={filteredTraces}
            models={mockModels}
            selectedModels={selectedModels}
            onFilterClick={setGlobalFilter}
            activeGlobalFilter={globalFilter}
          />
        </section>

        {/* Section C: Deployment Gates */}
        <section id="deployment-gates">
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="section-title">Production Readiness Gates</h2>
              </div>
              <p className="section-subtitle">Automated ship/no-ship verdict — every gate must pass before the candidate model goes live.</p>
            </div>
          </div>
          <DeploymentGates
            gates={gates}
            coverage={mockCoverage}
            onSelectGate={setSelectedGate}
          />
        </section>

        {/* Section D: Anomaly Evidence */}
        <section id="anomaly-evidence">
          <div className="section-header">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="section-title">Trace-Level Evidence</h2>
              </div>
              <p className="section-subtitle">Drill into individual traces to inspect model agreement, scores, and operator decisions.</p>
            </div>
          </div>
            <TraceEvidence
              traces={filteredTraces}
              models={mockModels}
              selectedModels={selectedModels}
              onSelectTrace={setSelectedTrace}
              selectedTraceId={selectedTrace?.trace_id ?? null}
            />
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

      {/* Gate Detail Slide-in */}
      {selectedGate && (
        <GateDetailPanel
          gate={selectedGate}
          onClose={() => setSelectedGate(null)}
          onSave={handleSaveGate}
        />
      )}
    </>
  );
}

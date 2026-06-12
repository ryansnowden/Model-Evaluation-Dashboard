import React, { useState } from 'react';
import { BarChart3, Microscope } from 'lucide-react';
import EvaluationOverview from './components/EvaluationOverview';
import ResearchInsights from './components/ResearchInsights';

type View = 'evaluation' | 'research';

export default function App() {
  const [view, setView] = useState<View>('evaluation');

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <h1>
            <span className="brand-dot" />
            VAD Model Eval
          </h1>
        </div>
        <div className="sidebar-nav">
          <div
            className={`nav-item ${view === 'evaluation' ? 'active' : ''}`}
            onClick={() => setView('evaluation')}
          >
            <BarChart3 size={16} />
            <span>Evaluation</span>
          </div>
          <div
            className={`nav-item ${view === 'research' ? 'active' : ''}`}
            onClick={() => setView('research')}
          >
            <Microscope size={16} />
            <span>Research Insights</span>
          </div>
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="text-muted" style={{ fontSize: 10, fontWeight: 500 }}>
            Dataset: full-suite-v1
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            250 traces · 5 models
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-area">
        <div className="topbar">
          <span className="topbar-title">
            {view === 'evaluation' ? 'Model Evaluation Overview' : 'Research Insights & Recommendations'}
          </span>
          <div className="flex items-center gap-2">
            <span className="badge badge-neutral">
              {view === 'evaluation' ? 'Last 30 Days' : '10 Papers · 8 Gaps · 4 Platforms'}
            </span>
          </div>
        </div>
        <div className="scroll-area">
          {view === 'evaluation' ? <EvaluationOverview /> : <ResearchInsights />}
        </div>
      </div>
    </div>
  );
}

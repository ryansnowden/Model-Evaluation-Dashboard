import React, { useState, useEffect } from 'react';
import { BarChart3, Microscope, BookOpen, Sun, Moon } from 'lucide-react';
import EvaluationOverview from './components/EvaluationOverview';
import ResearchInsights from './components/ResearchInsights';
import EvalDocs from './components/EvalDocs';

type View = 'evaluation' | 'research' | 'docs';
type Theme = 'dark' | 'light';

export default function App() {
  const [view, setView] = useState<View>('evaluation');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
            <span>Technical Insights</span>
          </div>
          <div
            className={`nav-item ${view === 'docs' ? 'active' : ''}`}
            onClick={() => setView('docs')}
          >
            <BookOpen size={16} />
            <span>Eval Docs</span>
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
            {view === 'evaluation' ? 'Model Evaluation Overview' :
             view === 'research' ? 'Technical Insights & Recommendations' :
             'Evaluation Documentation'}
          </span>
          <div className="flex items-center gap-4">
            <span className="badge badge-neutral">
              {view === 'evaluation' ? 'Last 30 Days' :
               view === 'research' ? 'Technical Insights' :
               'Visual Guide'}
            </span>
            <button
              onClick={toggleTheme}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', padding: 4, borderRadius: 'var(--radius-sm)'
              }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
        <div className="scroll-area">
          {view === 'evaluation' ? <EvaluationOverview /> :
           view === 'research' ? <ResearchInsights /> :
           <EvalDocs />}
        </div>
      </div>
    </div>
  );
}

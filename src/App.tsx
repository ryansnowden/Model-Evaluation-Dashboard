import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Microscope, BookOpen, Sun, Moon,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import EvaluationOverview from './components/EvaluationOverview';
import ResearchInsights from './components/ResearchInsights';
import EvalDocs from './components/EvalDocs';

type View = 'evaluation' | 'research' | 'docs';
type Theme = 'dark' | 'light';

interface SectionDef {
  id: string;
  label: string;
}

const SECTION_MAP: Record<View, SectionDef[]> = {
  evaluation: [
    { id: 'model-comparison', label: 'Model Comparison' },
    { id: 'error-analysis', label: 'Error Analysis' },
    { id: 'deployment-gates', label: 'Readiness Gates' },
    { id: 'anomaly-evidence', label: 'Trace Evidence' },
  ],
  research: [
    { id: 'capability-radar', label: 'Capability Radar' },
    { id: 'gap-analysis', label: 'Gap Analysis' },
    { id: 'benchmark-landscape', label: 'Benchmarks' },
    { id: 'case-studies', label: 'Case Studies' },
    { id: 'edge-hardware', label: 'Edge Hardware' },
    { id: 'technical-literature', label: 'Literature' },
    { id: 'eval-methodology', label: 'Eval Critique' },
    { id: 'adoption-roadmap', label: 'Roadmap' },
  ],
  docs: [
    { id: 'docs-getting-started', label: 'Getting Started' },
    { id: 'docs-workflow', label: 'Workflow' },
    { id: 'docs-section-1', label: 'Model Comparison' },
    { id: 'docs-section-2', label: 'Confusion Matrices' },
    { id: 'docs-section-3', label: 'Zone × Time' },
    { id: 'docs-section-4', label: 'Scenario F1' },
    { id: 'docs-section-5', label: 'Verdict' },
    { id: 'docs-section-6', label: 'Gate Checklist' },
    { id: 'docs-section-7', label: 'Coverage' },
    { id: 'docs-section-8', label: 'Filters' },
    { id: 'docs-section-9', label: 'Evidence Table' },
    { id: 'docs-section-10', label: 'Trace Header' },
    { id: 'docs-section-11', label: 'Trace Context' },
    { id: 'docs-section-12', label: 'Score Timeline' },
    { id: 'docs-section-13', label: 'Pipeline' },
    { id: 'docs-section-14', label: 'Model Scores' },
    { id: 'docs-troubleshooting', label: 'Troubleshooting' },
  ],
};

export default function App() {
  const [view, setView] = useState<View>('evaluation');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'dark';
  });
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleNavClick = (v: View) => {
    setView(v);
    setActiveSection(null);
  };

  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    // Small delay to ensure the section is rendered after view switch
    requestAnimationFrame(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sections = SECTION_MAP[view];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    // Observe after a small delay to ensure DOM is ready
    const timeout = setTimeout(() => {
      sections.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [view]);

  const navItems: { key: View; icon: React.ReactNode; label: string }[] = [
    { key: 'evaluation', icon: <BarChart3 size={16} />, label: 'Evaluation' },
    { key: 'research', icon: <Microscope size={16} />, label: 'Technical Insights' },
    { key: 'docs', icon: <BookOpen size={16} />, label: 'Eval Docs' },
  ];

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand">
          <h1>
            <span className="brand-dot" />
            <span>VAD Model Eval</span>
          </h1>
        </div>
        <div className="sidebar-nav">
          {navItems.map(item => (
            <React.Fragment key={item.key}>
              <div
                className={`nav-item ${view === item.key ? 'active' : ''}`}
                onClick={() => handleNavClick(item.key)}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
              {/* Sub-items — only show for active view when sidebar is expanded */}
              {view === item.key && !collapsed && SECTION_MAP[item.key].length > 0 && (
                <div className="nav-sub-items">
                  {SECTION_MAP[item.key].map(section => (
                    <div
                      key={section.id}
                      className={`nav-sub-item ${activeSection === section.id ? 'active' : ''}`}
                      onClick={() => handleSectionClick(section.id)}
                    >
                      {section.label}
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="sidebar-footer-meta" style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="text-muted" style={{ fontSize: 10, fontWeight: 500 }}>
            Dataset: full-suite-v1
          </div>
          <div className="text-muted" style={{ fontSize: 10, marginTop: 2 }}>
            250 traces · 5 models
          </div>
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
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

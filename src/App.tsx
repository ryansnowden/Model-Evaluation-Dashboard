import React, { useState } from 'react';
import { 
  BarChart3, Grid, Activity, Camera, Layers, 
  TestTube, CheckCircle, Tag, TrendingUp, Settings
} from 'lucide-react';

import ModelEvalPanel from './components/ModelEvalPanel';
import ClipGrid from './components/ClipGrid';
import OverviewPage from './components/OverviewPage';
import TracesPage from './components/TracesPage';

import SlicesPage from './components/SlicesPage';
import AblationRunsPage from './components/AblationRunsPage';
import CameraSessionsPage from './components/CameraSessionsPage';
import PassFailGatesPage from './components/PassFailGatesPage';

import LabelingStatusPage from './components/LabelingStatusPage';
import MonitoringPage from './components/MonitoringPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('clip-grid');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewPage />;
      case 'clip-grid': return <ClipGrid />;
      case 'traces': return <TracesPage />;
      case 'camera-sessions': return <CameraSessionsPage />;
      case 'model-eval': return <ModelEvalPanel />;
      case 'slices': return <SlicesPage />;
      case 'ablation': return <AblationRunsPage />;
      case 'gates': return <PassFailGatesPage />;
      case 'labeling': return <LabelingStatusPage />;
      case 'monitoring': return <MonitoringPage />;
      default: return <ClipGrid />;
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <li 
      className={"sidebar-nav-item " + (activeTab === id ? "active" : "")}
      onClick={() => setActiveTab(id)}
    >
      <Icon size={18} />
      <span>{label}</span>
    </li>
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>
            <span style={{color: 'var(--accent-orange)'}}>▶</span> 
            VAD Model Eval
          </h1>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-group-title">VAD Evaluation</div>
          <ul className="sidebar-nav">
            <NavItem id="overview" icon={BarChart3} label="Overview" />
            <NavItem id="clip-grid" icon={Grid} label="Clip Grid" />
          </ul>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-group-title">Observability</div>
          <ul className="sidebar-nav">
            <NavItem id="traces" icon={Activity} label="Incident Traces" />
            <NavItem id="camera-sessions" icon={Camera} label="Camera Sessions" />
          </ul>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-group-title">Evaluation</div>
          <ul className="sidebar-nav">
            <NavItem id="model-eval" icon={Settings} label="Model Eval Panel" />
            <NavItem id="slices" icon={Layers} label="Benchmark Slices" />
            <NavItem id="ablation" icon={TestTube} label="Ablation Runs" />
            <NavItem id="gates" icon={CheckCircle} label="Pass/Fail Gates" />
          </ul>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-group-title">Data Quality</div>
          <ul className="sidebar-nav">
            <NavItem id="labeling" icon={Tag} label="Labeling Status" />
          </ul>
        </div>

        <div className="sidebar-group">
          <div className="sidebar-group-title">Monitoring</div>
          <ul className="sidebar-nav">
            <NavItem id="monitoring" icon={TrendingUp} label="Drift & Health" />
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <div className="flex items-center gap-4">
            <span style={{fontWeight: 600}}>
              {activeTab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Global Filters placeholder */}
            <div className="btn">Last 30 Days</div>
            <div className="btn">Model: A4 (Full Stack)</div>
          </div>
        </div>
        
        <div className="scroll-container">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

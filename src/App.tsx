import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Award,
  ChevronRight,
  Filter,
  Info,
  Layers,
  Sparkles,
  TrendingUp,
  XCircle,
  FolderDot,
  Sun,
  Moon
} from 'lucide-react';
import { parseClipData, calculateMetrics } from './data';
import { SummaryCards } from './components/SummaryCards';
import { Visualizations } from './components/Visualizations';
import { CompareBench } from './components/CompareBench';
import { ClipExplorer } from './components/ClipExplorer';
import { ClipDetailModal } from './components/ClipDetailModal';
import { ClipData } from './types';
import { Scale, Calendar } from 'lucide-react';

export default function App() {
  // Load raw data
  const clips = useMemo(() => parseClipData(), []);

  // Filter States
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedDayType, setSelectedDayType] = useState<string>('');
  const [selectedGroundTruth, setSelectedGroundTruth] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  // Date Range Filter States
  const [startDate, setStartDate] = useState<string>('2026-05-22');
  const [endDate, setEndDate] = useState<string>('2026-06-11');

  // Selected compare versions side-by-side
  const [selectedCompareModels, setSelectedCompareModels] = useState<('v1' | 'v2' | 'v3')[]>(['v1', 'v2', 'v3']);

  // Drilldown Selected Clip
  const [selectedClip, setSelectedClip] = useState<ClipData | null>(null);

  // Active View State
  const [activeView, setActiveView] = useState<'overview' | 'visualizations' | 'data_explorer'>('overview');

  // Quick preset triggers
  const applyPreset = (preset: { zone?: string; dayType?: string; gt?: string; tag?: string }) => {
    setSelectedZone(preset.zone ?? '');
    setSelectedDayType(preset.dayType ?? '');
    setSelectedGroundTruth(preset.gt ?? '');
    setSelectedTag(preset.tag ?? '');
  };

  // Filtered raw clips based on active rules
  const filteredClips = useMemo(() => {
    return clips.filter((clip) => {
      // Date range filtering
      const clipDate = clip.timestamp_start.substring(0, 10);
      if (startDate && clipDate < startDate) return false;
      if (endDate && clipDate > endDate) return false;

      if (selectedZone && clip.zone_type !== selectedZone) return false;
      if (selectedDayType && clip.day_type !== selectedDayType) return false;
      if (selectedGroundTruth && clip.ground_truth !== selectedGroundTruth) return false;
      if (selectedTag && !clip.slice_tags.includes(selectedTag)) return false;
      return true;
    });
  }, [clips, startDate, endDate, selectedZone, selectedDayType, selectedGroundTruth, selectedTag]);

  // Compute live metrics dynamically based on current filtering and support model V3
  const liveMetricsV1 = useMemo(() => calculateMetrics(filteredClips, 'v1'), [filteredClips]);
  const liveMetricsV2 = useMemo(() => calculateMetrics(filteredClips, 'v2'), [filteredClips]);
  const liveMetricsV3 = useMemo(() => calculateMetrics(filteredClips, 'v3'), [filteredClips]);

  // Compute median times to alert for Actionable events
  const getMedianAlertTime = (version: 'v1' | 'v2' | 'v3') => {
    const times = filteredClips
      .filter((c) => c.ground_truth === 'actionable')
      .map((c) => {
        if (version === 'v1') return c.time_to_alert_sec_v1;
        if (version === 'v2') return c.time_to_alert_sec_v2;
        return c.time_to_alert_sec_v3;
      })
      .filter((t): t is number => t !== null)
      .sort((a, b) => a - b);

    if (times.length === 0) return 0;
    const mid = Math.floor(times.length / 2);
    return times.length % 2 !== 0 ? times[mid] : (times[mid - 1] + times[mid]) / 2;
  };

  const medianTimeV1 = useMemo(() => getMedianAlertTime('v1'), [filteredClips]);
  const medianTimeV2 = useMemo(() => getMedianAlertTime('v2'), [filteredClips]);
  const medianTimeOmitted = useMemo(() => getMedianAlertTime('v3'), [filteredClips]);

  // Quick stats computed details
  const totalClipsCount = clips.length;
  const filteredCount = filteredClips.length;

  const totalFpReduced = useMemo(() => {
    const v1Fp = clips.filter((c) => c.fp_v1 > 0).length;
    const v2Fp = clips.filter((c) => c.fp_v2 > 0).length;
    return v1Fp - v2Fp;
  }, [clips]);

  return (
    <div className="bg-slate-950 min-h-screen flex text-slate-100 font-sans antialiased overflow-hidden select-none dark" id="model-dashboard-root">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white hidden lg:flex flex-col border-r border-slate-800 shrink-0" id="sidebar-nav">
        <div className="p-6 h-16 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg text-white">Model Evaluate</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div 
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center cursor-pointer transition-colors ${activeView === 'overview' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className={`mr-3 ${activeView === 'overview' ? 'text-indigo-300' : 'opacity-45'}`}>#</span> Overview
          </div>
          <div 
            onClick={() => setActiveView('visualizations')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center cursor-pointer transition-colors ${activeView === 'visualizations' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className={`mr-3 ${activeView === 'visualizations' ? 'text-indigo-300' : 'opacity-45'}`}>#</span> Visualizations
          </div>
          <div 
            onClick={() => setActiveView('data_explorer')}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center cursor-pointer transition-colors ${activeView === 'data_explorer' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <span className={`mr-3 ${activeView === 'data_explorer' ? 'text-indigo-300' : 'opacity-45'}`}>#</span> Data Explorer
          </div>
        </nav>
        <div className="p-6 border-t border-slate-800 bg-slate-950/45">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-300 font-display text-sm shrink-0">
              SC
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Dr. Sarah Chen</p>
              <p className="text-[11px] text-slate-400 truncate font-mono">sicapitan@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Dashboard */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto" id="main-content-scroller">
        {/* Top Header */}
        <header className="bg-white dark:bg-slate-900 h-16 border-b border-slate-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between shadow-xs shrink-0 sticky top-0 z-40" id="main-header">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Model Evaluation
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Evaluation Set: May 31, 2026</p>
          </div>
          <div className="flex space-x-2">
            <button 
              id="export-pdf-btn"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors cursor-pointer animate-none"
            >
              Export Report
            </button>
            <button 
              id="retrain-model-btn"
              onClick={() => alert('V2 Production Release is highly stabilized. Current weights locked.')}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-all cursor-pointer"
            >
              Retrain Model
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto flex-grow">
        {/* Intro Block & Highlights Overview */}
        {activeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="infobar-row">
          <div className="col-span-1 lg:col-span-12 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between" id="marketing-teaser">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg text-xs tracking-wider mb-4 border border-white/5 font-semibold text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                MODEL EVALUATION
              </div>
              <h2 className="text-lg sm:text-2xl font-display font-light text-white leading-tight">
                Evaluating <span className="font-bold text-indigo-200">Event Coherence (Track A)</span> and <span className="font-bold text-indigo-200">Context-Aware Triage (Track B)</span>.
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl mt-2.5 leading-relaxed">
                Comparative analysis of Baseline configuration against revised stacks (Fine-Tuned V2 and Edge Omit V3). <strong>Track A</strong> improves missed/fragmented events in high-traffic atriums through temporal post-processing. <strong>Track B</strong> suppresses nuisance alerts (e.g., late-night cleaners) via context-aware triage, drastically dropping operational burden.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/10 text-xs">
              <div>
                <span className="text-slate-400 block font-mono text-[9.5px]">TOTAL TEST SUITE</span>
                <span className="text-lg font-bold font-display mt-0.5 block">{totalClipsCount} validation clips</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[9.5px]">REDUCED FP ALERTS</span>
                <span className="text-lg font-bold font-display mt-0.5 block text-indigo-300">-{totalFpReduced} false alarms</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono text-[9.5px]">MEDIAN LATENCY (V3)</span>
                <span className="text-lg font-bold font-display mt-0.5 block text-emerald-400">{medianTimeOmitted}s</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Quick Slice Presets Selector bar */}
        {activeView === 'data_explorer' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm" id="preset-filters-bar">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Explore Benchmark Slices:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
              <button
                id="preset-all"
                onClick={() => applyPreset({})}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border outline-none cursor-pointer ${
                  !selectedZone && !selectedDayType && !selectedGroundTruth && !selectedTag
                    ? 'bg-indigo-600 dark:bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                All Validation Suite
              </button>
              <button
                id="preset-track-a"
                onClick={() => applyPreset({ zone: 'public_atrium' })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border outline-none cursor-pointer ${
                  selectedZone === 'public_atrium' && !selectedTag
                    ? 'bg-indigo-600 dark:bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                Track A: Atrium Peak (Missed Events)
              </button>
              <button
                id="preset-track-b"
                onClick={() => applyPreset({ zone: 'service_corridor', tag: 'night' })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border outline-none cursor-pointer ${
                  selectedZone === 'service_corridor' && selectedTag === 'night'
                    ? 'bg-indigo-600 dark:bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                Track B: Corridor Late-Night (Nuisance)
              </button>
              <button
                id="preset-holdout"
                onClick={() => applyPreset({ zone: 'rooftop_event_space' })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border outline-none cursor-pointer ${
                  selectedZone === 'rooftop_event_space'
                    ? 'bg-indigo-600 dark:bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                Held-out Future Window
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Core Controls Section (Date Range & Side-by-Side Model Selector Checklist) */}
        {(activeView === 'overview' || activeView === 'visualizations') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center" id="core-filters-section">
          {/* Date range inputs */}
          <div className="col-span-1 md:col-span-6 space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              📅 Date Range Period (Timeline and comparison slices)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Start Evaluation Date</span>
                <input
                  type="date"
                  min="2026-05-22"
                  max="2026-06-11"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
              </div>
              <span className="text-slate-300 dark:text-slate-600 self-end mb-2 text-xs">to</span>
              <div className="flex-1">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">End Evaluation Date</span>
                <input
                  type="date"
                  min="2026-05-22"
                  max="2026-06-11"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-mono outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Model Selector Checklist */}
          <div className="col-span-1 md:col-span-6 space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              ⚙️ Compare Model Versions (Select multiple for side-by-side matrix bench)
            </label>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {[
                { key: 'v1' as const, label: 'Model V1 (Baseline)', color: 'bg-indigo-650' },
                { key: 'v2' as const, label: 'Model V2 (Fine-Tuned)', color: 'bg-indigo-650' },
                { key: 'v3' as const, label: 'Model V3 (Edge Optimized)', color: 'bg-indigo-650' },
              ].map((m) => {
                const isSelected = selectedCompareModels.includes(m.key);
                return (
                  <button
                    key={m.key}
                    id={`checkbox-compare-${m.key}`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCompareModels(selectedCompareModels.filter((k) => k !== m.key));
                      } else {
                        setSelectedCompareModels([...selectedCompareModels, m.key]);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {/* Dynamic Analytics & Executive Summary Cards Row */}
        {activeView === 'overview' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-mono text-slate-400 font-bold uppercase tracking-wide">
              Live Slice KPIs Match (Based on active filter parameters)
            </span>
            <span className="font-mono text-indigo-600 font-bold">
              {filteredCount} / {totalClipsCount} clips filtered
            </span>
          </div>

          <SummaryCards
            metricsV1={liveMetricsV1}
            metricsV2={liveMetricsV2}
            medianTimeV1={medianTimeV1}
            medianTimeV2={medianTimeV2}
          />
        </div>
        )}

        {/* Deep Dive Charts & Matrix Section */}
        {activeView === 'visualizations' && (
        <div className="space-y-6" id="dashboard-visuals-row">
          {/* Charts visual element */}
          <Visualizations
            filteredClips={filteredClips}
            metricsV1={liveMetricsV1}
            metricsV2={liveMetricsV2}
            metricsV3={liveMetricsV3}
          />
        </div>
        )}

        {activeView === 'overview' && (
        <div className="space-y-6" id="dashboard-compare-row">
          {/* Active Side-by-Side Model Comparison Bench */}
          <CompareBench
            selectedVersions={selectedCompareModels}
            metricsV1={liveMetricsV1}
            metricsV2={liveMetricsV2}
            metricsV3={liveMetricsV3}
          />
        </div>
        )}

        {/* Large searchable Clip explorer catalog */}
        {activeView === 'data_explorer' && (
        <div id="logs-catalogue">
          <ClipExplorer
            clips={clips}
            onSelectClip={setSelectedClip}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            selectedDayType={selectedDayType}
            setSelectedDayType={setSelectedDayType}
            selectedGroundTruth={selectedGroundTruth}
            setSelectedGroundTruth={setSelectedGroundTruth}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
          />
        </div>
        )}
      </main>

      {/* Humble Professional Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-slate-400 dark:text-slate-500 text-xs text-center mt-6" id="dashboard-footer">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <FolderDot className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="font-display font-medium text-slate-700 dark:text-slate-300">Model Validation and Registry Hub</span>
          </div>
          <p className="capitalize">
            Secure client-side sandbox environment tracking 100 validation trials under legal-compliant site monitoring.
          </p>
          <div className="text-[10px] font-mono select-none">
            © 2026 AnomalyEdge Ops. All pipelines green.
          </div>
        </div>
      </footer>
    </div>

    {/* Audit Detail pop-up Modal */}
    <ClipDetailModal clip={selectedClip} onClose={() => setSelectedClip(null)} />
  </div>
  );
}

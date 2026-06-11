import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Flame, BellOff, AlertTriangle, Scale, BarChart2, Award } from 'lucide-react';
import { MetricSummary } from '../types';

interface CompareBenchProps {
  selectedVersions: ('v1' | 'v2' | 'v3')[];
  metricsV1: MetricSummary;
  metricsV2: MetricSummary;
  metricsV3: MetricSummary;
}

export const CompareBench: React.FC<CompareBenchProps> = ({
  selectedVersions,
  metricsV1,
  metricsV2,
  metricsV3,
}) => {
  const getVersionDetails = (v: 'v1' | 'v2' | 'v3') => {
    switch (v) {
      case 'v1':
        return {
          title: 'Model V1 (Baseline)',
          subtitle: 'Static thresholds & basic spatial filters',
          color: 'slate',
          bgColor: 'bg-slate-900',
          borderColor: 'border-slate-300',
          metrics: metricsV1,
          badge: 'Baseline',
          tagline: 'Baseline detection model.',
        };
      case 'v2':
        return {
          title: 'Model V2 (Fine-Tuned)',
          subtitle: 'Temporal contrast masking',
          color: 'indigo',
          bgColor: 'bg-indigo-900',
          borderColor: 'border-indigo-300',
          metrics: metricsV2,
          badge: 'Production',
          tagline: 'Suppresses harmless repetitive activity.',
        };
      case 'v3':
        return {
          title: 'Model V3 (Edge Optimized)',
          subtitle: 'Spatio-temporal gating & edge optimization',
          color: 'emerald',
          bgColor: 'bg-emerald-950',
          borderColor: 'border-emerald-300',
          metrics: metricsV3,
          badge: 'Release Candidate',
          tagline: 'Optimized for precision and recall edge cases.',
        };
    }
  };

  if (selectedVersions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center" id="empty-compare-bench">
        <Scale className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <p className="text-slate-600 dark:text-slate-300 font-medium">No model versions selected for comparison.</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Please check at least two versions above to begin side-by-side analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="compare-bench-wrapper">
      <div className="flex items-center gap-2 px-1">
        <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
           Model Comparison ({selectedVersions.length} selected)
        </h3>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-${selectedVersions.length === 1 ? '1' : selectedVersions.length === 2 ? '2' : '3'} gap-6`} id="compare-bench-columns">
        {selectedVersions.map((versionKey, index) => {
          const info = getVersionDetails(versionKey);
          const metrics = info.metrics;
          const total = metrics.tp + metrics.fp + metrics.fn + metrics.tn || 1;

          const tpRate = ((metrics.tp / total) * 100).toFixed(1);
          const fpRate = ((metrics.fp / total) * 100).toFixed(1);
          const fnRate = ((metrics.fn / total) * 100).toFixed(1);
          const tnRate = ((metrics.tn / total) * 100).toFixed(1);

          return (
            <motion.div
              key={versionKey}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between"
              id={`compare-column-${versionKey}`}
            >
              <div>
                {/* Header Band */}
                <div className={`${info.bgColor} p-3 text-white relative`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full font-bold text-white">
                      {info.badge}
                    </span>
                    <span className="text-white/45 font-mono text-[10px]">#{versionKey.toUpperCase()}</span>
                  </div>
                  <h4 className="text-sm font-bold font-display leading-tight">{info.title}</h4>
                  <p className="text-xs text-white/70 mt-1 font-sans">{info.subtitle}</p>
                </div>

                {/* Accuracy, Precision, Recall visual progress meters */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
                  <h5 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Core Metric Profiles
                  </h5>

                  <div className="space-y-3">
                    {/* ACCURACY */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-300 font-medium font-sans">Accuracy Index</span>
                        <strong className="font-mono text-slate-900 dark:text-white text-xs">{(metrics.accuracy * 100).toFixed(1)}%</strong>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            versionKey === 'v1' ? 'bg-slate-400' : versionKey === 'v2' ? 'bg-indigo-600' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${metrics.accuracy * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* PRECISION */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Precision Rate</span>
                        <strong className="font-mono text-slate-900 dark:text-white text-xs">{(metrics.precision * 100).toFixed(1)}%</strong>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            versionKey === 'v1' ? 'bg-slate-400' : versionKey === 'v2' ? 'bg-indigo-600' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${metrics.precision * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* RECALL */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Recall Rate (Sensitivity)</span>
                        <strong className="font-mono text-slate-900 dark:text-white text-xs">{(metrics.recall * 100).toFixed(1)}%</strong>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            versionKey === 'v1' ? 'bg-slate-400' : versionKey === 'v2' ? 'bg-indigo-600' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${metrics.recall * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Parallel Confusion Matrix 2x2 grid */}
                <div className="p-3 space-y-2.5">
                  <h5 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Side-by-Side Confusion Matrix
                  </h5>

                  <div className="grid grid-cols-2 gap-1.5">
                    {/* True Positive */}
                    <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-1.5 flex flex-col justify-between h-16 relative">
                      <span className="absolute top-1 right-1 text-[8px] font-mono font-bold text-emerald-600/30">TP</span>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold font-mono">
                        <Flame className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                        <span>TP</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{metrics.tp}</span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-500">{tpRate}%</span>
                      </div>
                    </div>

                    {/* False Positive */}
                    <div className={`border rounded-lg p-1.5 flex flex-col justify-between h-16 relative ${
                      metrics.fp > 0 
                        ? 'bg-rose-50/25 border-rose-100 dark:bg-rose-950/10 dark:border-rose-900/30' 
                        : 'bg-slate-50/40 border-slate-100 dark:bg-slate-900/40 dark:border-slate-800'
                    }`}>
                      <span className="absolute top-1 right-1 text-[8px] font-mono font-bold text-slate-400/30">FP</span>
                      <div className={`flex items-center gap-1 text-[10px] font-semibold font-mono ${
                        metrics.fp > 0 ? 'text-rose-800 dark:text-rose-400 font-bold' : 'text-slate-400 dark:text-slate-500 font-normal'
                      }`}>
                        <AlertTriangle className={`w-3.5 h-3.5 ${metrics.fp > 0 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-300 dark:text-slate-600'}`} />
                        <span>FP</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className={`text-lg font-bold ${metrics.fp > 0 ? 'text-rose-700' : 'text-slate-400'}`}>{metrics.fp}</span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{fpRate}%</span>
                      </div>
                    </div>

                    {/* False Negative */}
                    <div className={`border rounded-lg p-1.5 flex flex-col justify-between h-16 relative ${
                      metrics.fn > 0 
                        ? 'bg-amber-50/25 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30' 
                        : 'bg-slate-50/40 border-slate-100 dark:bg-slate-900/40 dark:border-slate-800'
                    }`}>
                      <span className="absolute top-1 right-1 text-[8px] font-mono font-bold text-slate-400/30">FN</span>
                      <div className={`flex items-center gap-1 text-[10px] font-semibold font-mono ${
                        metrics.fn > 0 ? 'text-amber-800 dark:text-amber-400 font-bold' : 'text-slate-400 dark:text-slate-500 font-normal'
                      }`}>
                        <BellOff className={`w-3.5 h-3.5 ${metrics.fn > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-300 dark:text-slate-600'}`} />
                        <span>FN</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className={`text-lg font-bold ${metrics.fn > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`}>{metrics.fn}</span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{fnRate}%</span>
                      </div>
                    </div>

                    {/* True Negative */}
                    <div className="bg-indigo-50/10 dark:bg-indigo-950/10 border border-slate-100 dark:border-slate-800/80 rounded-lg p-1.5 flex flex-col justify-between h-16 relative">
                      <span className="absolute top-1 right-1 text-[8px] font-mono font-bold text-indigo-500/20">TN</span>
                      <div className="flex items-center gap-1 text-[10px] text-indigo-800 dark:text-indigo-400 font-semibold font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        <span>TN</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{metrics.tn}</span>
                        <span className="text-[10px] font-mono text-indigo-500">{tnRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operational Quality section */}
                <div className="p-3 space-y-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40">
                  <h5 className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Operational Burden & Quality
                  </h5>
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 font-medium font-sans">FAR per 100 hrs</span>
                      <strong className={`font-mono text-xs ${versionKey === 'v1' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {versionKey === 'v1' ? '8.4' : versionKey === 'v2' ? '2.1' : '0.8'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80 pt-2">
                      <span className="text-slate-600 dark:text-slate-300 font-medium font-sans" title="Number of predicted fragments per true event (Track A metric)">Fragmentation Index</span>
                      <strong className={`font-mono text-xs ${versionKey === 'v1' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                        {versionKey === 'v1' ? '3.0' : versionKey === 'v2' ? '1.4' : '1.0'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80 pt-2">
                      <span className="text-slate-600 dark:text-slate-300 font-medium font-sans" title="Temporal Intersection-over-Union (Overlap > 0.5 is pass)">Median tIoU</span>
                      <strong className={`font-mono text-xs ${versionKey === 'v1' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {versionKey === 'v1' ? '0.15 (fail)' : versionKey === 'v2' ? '0.62 (pass)' : '0.85 (pass)'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800/80 pt-2">
                      <span className="text-slate-600 dark:text-slate-300 font-medium font-sans" title="Share of escalated alerts confirmed by operators">Confirmation Rate</span>
                      <strong className={`font-mono text-xs ${versionKey === 'v1' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {versionKey === 'v1' ? '11%' : versionKey === 'v2' ? '74%' : '91%'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tagline footer details */}
              <div className="p-2 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 leading-normal flex items-center italic">
                "{info.tagline}"
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Tag, ShieldCheck, AlertCircle, AlertTriangle, HelpCircle, Activity, Layout, Clock, Anchor } from 'lucide-react';
import { ClipData } from '../types';

interface ClipDetailModalProps {
  clip: ClipData | null;
  onClose: () => void;
}

export const ClipDetailModal: React.FC<ClipDetailModalProps> = ({ clip, onClose }) => {
  if (!clip) return null;

  // Compute status relationships
  const isFpCorrection = clip.ground_truth === 'benign' && clip.alerted_v1 === 'yes' && clip.alerted_v2 === 'no';
  const isTpMatch = clip.ground_truth === 'actionable' && clip.alerted_v1 === 'yes' && clip.alerted_v2 === 'yes';
  const isTnMatch = clip.ground_truth === 'benign' && clip.alerted_v1 === 'no' && clip.alerted_v2 === 'no';
  const isV1FpEscalated = clip.ground_truth === 'benign' && clip.alerted_v1 === 'yes' && clip.triage_decision_v1 === 'escalated';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-xs" id="clip-modal-overlay">
        {/* Backdrop anim */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-10"
          id="clip-modal-content"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {clip.clip_id}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{clip.timestamp_start}</span>
              </div>
              <h2 className="text-base font-display font-bold text-slate-900 dark:text-white capitalize">
                {clip.scenario_label.replace(/_/g, ' ')}
              </h2>
            </div>
            <button
              onClick={onClose}
              id="close-modal-btn"
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body content scrollable */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Quick Context Summary Flags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 block font-bold">Zone / Camera ID</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {clip.camera_id} • <span className="capitalize">{clip.zone_type.replace(/_/g, ' ')}</span>
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 block font-bold">Schedule Shift</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block capitalize">
                    {clip.local_time_band} ({clip.day_type})
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2.5">
                <Anchor className="w-4 h-4 text-slate-400 dark:text-slate-400 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 block font-bold">Ground Truth Target</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        clip.ground_truth === 'actionable'
                          ? 'bg-rose-500'
                          : clip.ground_truth === 'benign'
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                      }`}
                    ></span>
                    <span className="capitalize">{clip.ground_truth}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Evaluation Highlight Card (Why v2 counts) */}
            {isFpCorrection && (
              <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
                    Track B: Triage Success (False Positive Correction)
                  </h4>
                  <p className="text-xs text-emerald-700/85 dark:text-emerald-300/80 leading-normal mt-1">
                    Model V1 triggered an unwanted nuisance alarm with a score of{' '}
                    <strong className="font-mono">{clip.anomaly_score_v1}</strong>.
                    Revised models successfully suppressed this (filtering it safely down to <strong className="font-mono">{clip.anomaly_score_v2}</strong>) using context-aware triage, schedule matching, and operational rules—preventing operator burden and greatly reducing FAR.
                  </p>
                </div>
              </div>
            )}

            {isTpMatch && (
              <div className="p-4 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/35 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wide">
                    Track A: Event Coherence and Stitching Corrected
                  </h4>
                  <p className="text-xs text-rose-700/85 dark:text-rose-300/80 leading-normal mt-1">
                    Model V1 suffered from fragmented detection (resulting in low tIoU overlap) creating multiple confusing micro-alerts. Revised models implement proper temporal post-processing to consolidate raw spikes into one continuous, high-confidence operator event. Optimal latency achieved ({clip.time_to_alert_sec_v3 || clip.time_to_alert_sec_v2}s).
                  </p>
                </div>
              </div>
            )}

            {isTnMatch && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wide">
                    Normal Operational Pattern Correctly Ignored
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-1">
                    This benign scene was successfully kept silent by both Model V1 and Model V2, maintaining operations
                    without unnecessary console disruptions.
                  </p>
                </div>
              </div>
            )}

            {/* Score Comparison Bars */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-display font-bold text-slate-800 dark:text-white">Anomaly Confidence Profiles</h3>
              
              {/* Model V1 Score */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 overflow-hidden">
                  <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    Model V1 Anomaly Score
                    {clip.alerted_v1 === 'yes' && (
                      <span className="px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-mono text-[9px] rounded font-bold">ALERT</span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-400">{clip.anomaly_score_v1.toFixed(2)} / Threshold: {clip.threshold_v1.toFixed(2)}</span>
                </div>
                <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      clip.alerted_v1 === 'yes' ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                    style={{ width: `${clip.anomaly_score_v1 * 100}%` }}
                  ></div>
                  {/* Threshold mark */}
                  <div className="absolute top-0 bottom-0 w-[2px] bg-slate-900 dark:bg-slate-700" style={{ left: `${clip.threshold_v1 * 100}%` }}></div>
                </div>
              </div>

              {/* Model V2 Score */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 overflow-hidden">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    Model V2 Anomaly Score
                    {clip.alerted_v2 === 'yes' && (
                      <span className="px-1.5 py-0.2 bg-indigo-650 dark:bg-indigo-900/60 text-white font-mono text-[9px] rounded font-bold">ALERT</span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-400">{clip.anomaly_score_v2.toFixed(2)} / Threshold: {clip.threshold_v2.toFixed(2)}</span>
                </div>
                <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      clip.alerted_v2 === 'yes' ? 'bg-indigo-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${clip.anomaly_score_v2 * 100}%` }}
                  ></div>
                  {/* Threshold mark */}
                  <div className="absolute top-0 bottom-0 w-[2px] bg-slate-950 dark:bg-slate-650" style={{ left: `${clip.threshold_v2 * 100}%` }}></div>
                </div>
              </div>

               {/* Model V3 Score */}
               <div>
                <div className="flex items-center justify-between text-xs mb-1.5 overflow-hidden">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    Model V3 Anomaly Score
                    {clip.alerted_v3 === 'yes' && (
                      <span className="px-1.5 py-0.2 bg-emerald-650 dark:bg-emerald-900/60 text-white font-mono text-[9px] rounded font-bold">ALERT</span>
                    )}
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-400">{clip.anomaly_score_v3.toFixed(2)} / Threshold: {clip.threshold_v3.toFixed(2)}</span>
                </div>
                <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      clip.alerted_v3 === 'yes' ? 'bg-emerald-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${clip.anomaly_score_v3 * 100}%` }}
                  ></div>
                  {/* Threshold mark */}
                  <div className="absolute top-0 bottom-0 w-[2px] bg-slate-950 dark:bg-slate-650" style={{ left: `${clip.threshold_v3 * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* Side-by-Side Model Triage Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Model V1 Break */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Model V1 Triage Outcome
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Decision:</span>
                      <span className={`font-semibold ml-1.5 capitalize ${clip.triage_decision_v1 === 'escalated' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {clip.triage_decision_v1 || 'Silent'}
                      </span>
                    </div>
                    {clip.triage_reason_v1 && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block">Reason:</span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium capitalize mt-0.5 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100/50 dark:border-slate-800 break-words leading-tight">
                          {clip.triage_reason_v1.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {clip.time_to_alert_sec_v1 !== null && (
                  <div className="mt-4 pt-2 border-t border-slate-50 dark:border-slate-800/40 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    <span>Latency:</span>
                    <span>{clip.time_to_alert_sec_v1}s</span>
                  </div>
                )}
              </div>            {/* Model V2 Break */}
              <div className="border border-indigo-100/70 dark:border-indigo-950/50 bg-indigo-50/10 dark:bg-indigo-950/10 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-2">
                    Model V2 Triage Outcome
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Decision:</span>
                      <span className={`font-semibold ml-1.5 capitalize ${clip.triage_decision_v2 === 'escalated' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                        {clip.triage_decision_v2 || 'Silent'}
                      </span>
                    </div>
                    {clip.triage_reason_v2 && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block">Reason:</span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium capitalize mt-0.5 bg-indigo-50/40 dark:bg-indigo-950/20 p-1.5 rounded border border-indigo-100/30 dark:border-indigo-950/40 break-words leading-tight">
                          {clip.triage_reason_v2.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {clip.time_to_alert_sec_v2 !== null && (
                  <div className="mt-4 pt-2 border-t border-slate-50/50 dark:border-slate-801 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">Latency:</span>
                    <span className="text-indigo-900 dark:text-indigo-300 font-bold">{clip.time_to_alert_sec_v2}s</span>
                  </div>
                )}
              </div>

               {/* Model V3 Break */}
               <div className="border border-emerald-100/70 dark:border-emerald-950/50 bg-emerald-50/10 dark:bg-emerald-950/10 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 mb-2">
                    Model V3 Triage Outcome
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Decision:</span>
                      <span className={`font-semibold ml-1.5 capitalize ${clip.triage_decision_v3 === 'escalated' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                        {clip.triage_decision_v3 || 'Silent'}
                      </span>
                    </div>
                    {clip.triage_reason_v3 && (
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block">Reason:</span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium capitalize mt-0.5 bg-emerald-55/40 dark:bg-emerald-950/20 p-1.5 rounded border border-emerald-100/30 dark:border-emerald-950/40 break-words leading-tight">
                          {clip.triage_reason_v3.replace(/_/g, ' ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {clip.time_to_alert_sec_v3 !== null && (
                  <div className="mt-4 pt-2 border-t border-slate-50/50 dark:border-slate-801 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Latency:</span>
                    <span className="text-emerald-900 dark:text-emerald-300 font-bold">{clip.time_to_alert_sec_v3}s</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Analysis & False Positive Reason */}
            {clip.false_positive_reason && (
              <div className="bg-amber-50/35 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4">
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Nuisance Trigger Analysis
                </h4>
                <p className="text-xs text-amber-900 dark:text-amber-300 font-medium capitalize mt-1.5 leading-relaxed">
                  {clip.false_positive_reason.replace(/_/g, ' ')}
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-500 mt-1">
                  V1 was particularly sensitive to large horizontal structures, reflective trolley glares, and unusual staff pauses in corridors, falsely labeling them as trespass actions. V2 applies local scene masking to resolve these patterns.
                </p>
              </div>
            )}

            {/* Slice Tags & Ship blockers */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <div className="flex flex-wrap gap-1">
                  {clip.slice_tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-mono text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">Ship Blocker Outcome:</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase ${
                    clip.ship_blocker === 'yes'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                  }`}
                >
                  {clip.ship_blocker === 'yes' ? 'BLOCKER' : 'SAFE TO SHIP'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

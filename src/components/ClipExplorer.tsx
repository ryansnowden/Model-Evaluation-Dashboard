import React, { useState, useMemo } from 'react';
import { Search, Filter, Shield, AlertTriangle, HelpCircle, Eye, RefreshCw, X } from 'lucide-react';
import { ClipData } from '../types';

interface ClipExplorerProps {
  clips: ClipData[];
  onSelectClip: (clip: ClipData) => void;
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  selectedDayType: string;
  setSelectedDayType: (dayType: string) => void;
  selectedGroundTruth: string;
  setSelectedGroundTruth: (gt: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}

export const ClipExplorer: React.FC<ClipExplorerProps> = ({
  clips,
  onSelectClip,
  selectedZone,
  setSelectedZone,
  selectedDayType,
  setSelectedDayType,
  selectedGroundTruth,
  setSelectedGroundTruth,
  selectedTag,
  setSelectedTag,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract all unique zones and tags for filters dropdowns
  const uniqueZones = useMemo(() => {
    const zones = new Set<string>();
    clips.forEach((c) => zones.add(c.zone_type));
    return Array.from(zones).sort();
  }, [clips]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    clips.forEach((c) => c.slice_tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [clips]);

  // Filtering Logic
  const filteredClips = useMemo(() => {
    return clips.filter((clip) => {
      // Zone filter
      if (selectedZone && clip.zone_type !== selectedZone) return false;
      
      // DayType filter
      if (selectedDayType && clip.day_type !== selectedDayType) return false;

      // Ground truth filter
      if (selectedGroundTruth && clip.ground_truth !== selectedGroundTruth) return false;

      // Tag filter
      if (selectedTag && !clip.slice_tags.includes(selectedTag)) return false;

      // Text search (Clip ID, Camera, Scenario, triage reason, FP reason)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesText =
          clip.clip_id.toLowerCase().includes(query) ||
          clip.camera_id.toLowerCase().includes(query) ||
          clip.scenario_label.toLowerCase().includes(query) ||
          clip.triage_reason_v1.toLowerCase().includes(query) ||
          clip.triage_reason_v2.toLowerCase().includes(query) ||
          clip.false_positive_reason.toLowerCase().includes(query);
        if (!matchesText) return false;
      }

      return true;
    });
  }, [clips, selectedZone, selectedDayType, selectedGroundTruth, selectedTag, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredClips.length / itemsPerPage) || 1;
  const paginatedClips = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredClips.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredClips, currentPage]);

  const handleResetFilters = () => {
    setSelectedZone('');
    setSelectedDayType('');
    setSelectedGroundTruth('');
    setSelectedTag('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedZone || selectedDayType || selectedGroundTruth || selectedTag || searchQuery;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm" id="clip-explorer">
      {/* Explorer Controls */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 cb pb-5 mb-5 overflow-visible">
        <div>
          <h3 className="text-sm font-display font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Clip Logs Explorer
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-mono text-xs font-bold">
              {filteredClips.length} of {clips.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Filter, inspect, and audit individual evaluation slices and scores</p>
        </div>

        {/* Search & Reset */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <div className="relative flex-grow md:flex-grow-0 md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-400" />
            <input
              id="clip-search-input"
              type="text"
              placeholder="Search clip ID, scenario, or reason..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2 w-full text-xs border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              id="reset-filters-btn"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/35 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Structured Dropdown filter bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 p-4 bg-slate-100/80 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-bold">Zone Type</label>
          <select
            id="zone-select"
            value={selectedZone}
            onChange={(e) => {
              setSelectedZone(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-705 dark:text-slate-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" className="dark:bg-slate-800">All Zones</option>
            {uniqueZones.map((z) => (
              <option key={z} value={z} className="dark:bg-slate-800">
                {z.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-bold">Day Type</label>
          <select
            id="day-type-select"
            value={selectedDayType}
            onChange={(e) => {
              setSelectedDayType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" className="dark:bg-slate-800">All Days</option>
            <option value="weekday" className="dark:bg-slate-800">Weekdays</option>
            <option value="weekend" className="dark:bg-slate-800">Weekends</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-bold">Ground Truth</label>
          <select
            id="ground-truth-select"
            value={selectedGroundTruth}
            onChange={(e) => {
              setSelectedGroundTruth(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" className="dark:bg-slate-800">All Ground Truths</option>
            <option value="benign" className="dark:bg-slate-800">Benign Operations</option>
            <option value="actionable" className="dark:bg-slate-800">Actionable Intrusion</option>
            <option value="unclear" className="dark:bg-slate-800">Unclear</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-bold">Tag Slice</label>
          <select
            id="tag-select"
            value={selectedTag}
            onChange={(e) => {
              setSelectedTag(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" className="dark:bg-slate-800">All Slice Tags</option>
            {uniqueTags.map((tag) => (
              <option key={tag} value={tag} className="dark:bg-slate-800">#{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List or Table of Clips */}
      <div className="overflow-x-auto w-full border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
        <table className="w-full text-left border-collapse" id="clips-table">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3">Clip ID</th>
              <th className="px-4 py-3">Location Details</th>
              <th className="px-4 py-3">Scenario Detected</th>
              <th className="px-4 py-3 text-center">Ground Truth</th>
              <th className="px-4 py-3 text-center">Model V1 (Alert)</th>
              <th className="px-4 py-3 text-center">Model V2 (Alert)</th>
              <th className="px-4 py-3 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
            {paginatedClips.length > 0 ? (
              paginatedClips.map((clip) => {
                const getGtStyle = (gt: string) => {
                  switch (gt) {
                    case 'actionable':
                      return 'bg-rose-50 text-rose-700 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/35';
                    case 'benign':
                      return 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
                    default:
                      return 'bg-slate-50 text-slate-600 border border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
                  }
                };

                const getAlertStatusStyle = (alerted: 'yes' | 'no', score: number, threshold: number, isV2: boolean) => {
                  if (alerted === 'yes') {
                    return {
                      badge: isV2 ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-150 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/35' : 'bg-amber-50 text-amber-800 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
                      text: `Alerted (★ ${score.toFixed(2)})`,
                    };
                  }
                  return {
                    badge: 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
                    text: `Ignored (${score.toFixed(2)})`,
                  };
                };

                const v1Style = getAlertStatusStyle(clip.alerted_v1, clip.anomaly_score_v1, clip.threshold_v1, false);
                const v2Style = getAlertStatusStyle(clip.alerted_v2, clip.anomaly_score_v2, clip.threshold_v2, true);

                return (
                  <tr
                    key={clip.clip_id}
                    id={`clip-row-${clip.clip_id}`}
                    onClick={() => onSelectClip(clip)}
                    className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    {/* Clip ID */}
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800 dark:text-white">
                      {clip.clip_id}
                    </td>

                    {/* Camera and Zone */}
                    <td className="px-4 py-3.5 max-w-[180px]">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate">{clip.camera_id}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 capitalize truncate mt-0.5">
                        {clip.zone_type.replace(/_/g, ' ')}
                      </div>
                    </td>

                    {/* Scenario Title + tags */}
                    <td className="px-4 py-3.5 max-w-[280px]">
                      <span className="font-medium text-slate-800 dark:text-slate-200 capitalize block truncate">
                        {clip.scenario_label.replace(/_/g, ' ')}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1 max-h-[18px] overflow-hidden">
                        {clip.slice_tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[9px] font-mono text-slate-400 dark:text-slate-500">
                            #{tag}
                          </span>
                        ))}
                        {clip.slice_tags.length > 3 && (
                          <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-bold font-mono">
                            +{clip.slice_tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Ground Truth */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${getGtStyle(clip.ground_truth)}`}>
                        {clip.ground_truth}
                      </span>
                    </td>

                    {/* Model V1 status */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10.5px] font-mono ${v1Style.badge}`}>
                        {v1Style.text}
                      </span>
                    </td>

                    {/* Model V2 status */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10.5px] font-mono ${v2Style.badge}`}>
                        {v2Style.text}
                      </span>
                    </td>

                    {/* Action button */}
                    <td className="px-4 py-3.5 text-right font-sans">
                      <button className="p-1 px-2.5 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto transition-all bg-transparent border-none">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Audit</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <span>No clips match your selected filter criteria.</span>
                    <button onClick={handleResetFilters} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline mt-1 bg-transparent border-none cursor-pointer">
                      Reset all filters
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50 dark:border-slate-800" id="explorer-pagination">
          <span className="text-xs text-slate-405 dark:text-slate-500 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                currentPage === 1
                  ? 'border-slate-100 text-slate-300 bg-slate-50 dark:border-slate-800 dark:text-slate-600 dark:bg-slate-900 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                currentPage === totalPages
                  ? 'border-slate-100 text-slate-300 bg-slate-50 dark:border-slate-800 dark:text-slate-600 dark:bg-slate-900 cursor-not-allowed'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

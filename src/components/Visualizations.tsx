import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ZAxis,
  LineChart,
  Line,
  LabelList,
} from 'recharts';
import { Clock, Activity, TrendingUp, CalendarDays, LineChart as LineIcon, MapPin, Sparkles, Info } from 'lucide-react';
import { ClipData, MetricSummary } from '../types';
import { calculateMetrics } from '../data';

interface VisualizationsProps {
  filteredClips: ClipData[];
  metricsV1: MetricSummary;
  metricsV2: MetricSummary;
  metricsV3: MetricSummary;
}

export const Visualizations: React.FC<VisualizationsProps> = ({
  filteredClips,
  metricsV1,
  metricsV2,
  metricsV3,
}) => {
  // 1. Grouped Metrics Data
  const metricsData = [
    {
      name: 'Precision',
      V1: Math.round(metricsV1.precision * 100),
      V2: Math.round(metricsV2.precision * 100),
      V3: Math.round(metricsV3.precision * 100),
    },
    {
      name: 'Recall',
      V1: Math.round(metricsV1.recall * 100),
      V2: Math.round(metricsV2.recall * 100),
      V3: Math.round(metricsV3.recall * 100),
    },
    {
      name: 'Accuracy',
      V1: Math.round(metricsV1.accuracy * 100),
      V2: Math.round(metricsV2.accuracy * 100),
      V3: Math.round(metricsV3.accuracy * 100),
    },
    {
      name: 'F1 Score',
      V1: Math.round(metricsV1.f1 * 100),
      V2: Math.round(metricsV2.f1 * 100),
      V3: Math.round(metricsV3.f1 * 100),
    },
  ];

  // 2. Score Distribution (Scatter Data)
  const scatterData = filteredClips.map((clip) => {
    let category = '';
    if (clip.ground_truth === 'actionable') {
      category = 'Actionable Intrusions / Hazards';
    } else if (clip.ground_truth === 'benign') {
      category = 'Benign / Operational Shifts';
    } else {
      category = 'Unclear';
    }

    return {
      id: clip.clip_id,
      v1: clip.anomaly_score_v1,
      v2: clip.anomaly_score_v2,
      v3: clip.anomaly_score_v3,
      name: clip.scenario_label.replace(/_/g, ' '),
      category,
      ground_truth: clip.ground_truth,
    };
  });

  // Split scatter by category for styling/groups
  const actionableScatter = scatterData.filter((d) => d.ground_truth === 'actionable');
  const benignScatter = scatterData.filter((d) => d.ground_truth === 'benign');
  const unclearScatter = scatterData.filter((d) => d.ground_truth === 'unclear');

  // 3. Time-to-alert speed comparison (Latency for true positives)
  const truePositivesV1 = filteredClips.filter(
    (c) => c.ground_truth === 'actionable' && c.time_to_alert_sec_v1 !== null
  );
  const truePositivesV2 = filteredClips.filter(
    (c) => c.ground_truth === 'actionable' && c.time_to_alert_sec_v2 !== null
  );
  const truePositivesV3 = filteredClips.filter(
    (c) => c.ground_truth === 'actionable' && c.time_to_alert_sec_v3 !== null
  );

  const avgLatencyV1 = truePositivesV1.length
    ? truePositivesV1.reduce((acc, c) => acc + (c.time_to_alert_sec_v1 || 0), 0) / truePositivesV1.length
    : 0;
  const avgLatencyV2 = truePositivesV2.length
    ? truePositivesV2.reduce((acc, c) => acc + (c.time_to_alert_sec_v2 || 0), 0) / truePositivesV2.length
    : 0;
  const avgLatencyV3 = truePositivesV3.length
    ? truePositivesV3.reduce((acc, c) => acc + (c.time_to_alert_sec_v3 || 0), 0) / truePositivesV3.length
    : 0;

  // Active Metric for the Timeline Line Chart
  const [selectedTimelineMetric, setSelectedTimelineMetric] = useState<'accuracy' | 'precision' | 'recall'>('accuracy');

  // HEATMAP SETTINGS & STATES
  const [heatmapMetric, setHeatmapMetric] = useState<'actionable' | 'v1' | 'v2' | 'v3' | 'total'>('actionable');
  const [hoveredCell, setHoveredCell] = useState<{ locId: string; bucketId: string } | null>(null);

  const locations = [
    { id: 'B2-SERV-014', name: 'Service Corridor A', zone: 'Service Corridors' },
    { id: 'B2-SERV-015', name: 'Service Corridor B', zone: 'Service Corridors' },
    { id: 'B2-SERV-017', name: 'Service Corridor C', zone: 'Service Corridors' },
    { id: 'B2-SERV-018', name: 'Service Corridor D', zone: 'Service Corridors' },
    { id: 'B2-SERV-016', name: 'Loading Dock Bay 1', zone: 'Loading Docks' },
    { id: 'B2-DOCK-021', name: 'Loading Dock Bay 2', zone: 'Loading Docks' },
    { id: 'B2-DOCK-022', name: 'Loading Dock Bay 3', zone: 'Loading Docks' },
  ];

  const timeBuckets = [
    { id: 'late_night', label: 'Late Night', hours: '00:00 - 04:00', icon: '🌙' },
    { id: 'early_morning', label: 'Early Morning', hours: '04:00 - 08:00', icon: '🌅' },
    { id: 'midday', label: 'Midday Shift', hours: '08:00 - 12:00', icon: '☀️' },
    { id: 'afternoon', label: 'Afternoon Shift', hours: '12:00 - 16:00', icon: '🌤️' },
    { id: 'evening', label: 'Evening Shift', hours: '16:00 - 20:00', icon: '🌇' },
    { id: 'night', label: 'Late Night Shift', hours: '20:00 - 00:00', icon: '🌃' },
  ];

  const getHour = (timestampStr: string): number => {
    try {
      const parts = timestampStr.split(' ');
      if (parts[1]) {
        const hourPart = parts[1].split(':')[0];
        return parseInt(hourPart, 10);
      }
    } catch (e) {}
    return 0;
  };

  const getTimeBucket = (hour: number) => {
    if (hour >= 0 && hour < 4) return 'late_night';
    if (hour >= 4 && hour < 8) return 'early_morning';
    if (hour >= 8 && hour < 12) return 'midday';
    if (hour >= 12 && hour < 16) return 'afternoon';
    if (hour >= 16 && hour < 20) return 'evening';
    return 'night';
  };

  const heatmapGrid = useMemo(() => {
    const grid: {
      [locId: string]: {
        [bucketId: string]: {
          clips: ClipData[];
          actionableCount: number;
          v1Alerts: number;
          v2Alerts: number;
          v3Alerts: number;
          totalCount: number;
        };
      };
    } = {};

    locations.forEach((loc) => {
      grid[loc.id] = {};
      timeBuckets.forEach((bucket) => {
        grid[loc.id][bucket.id] = {
          clips: [],
          actionableCount: 0,
          v1Alerts: 0,
          v2Alerts: 0,
          v3Alerts: 0,
          totalCount: 0,
        };
      });
    });

    filteredClips.forEach((clip) => {
      const locId = clip.camera_id;
      if (grid[locId]) {
        const hour = getHour(clip.timestamp_start);
        const bucketId = getTimeBucket(hour);
        const cell = grid[locId][bucketId];
        if (cell) {
          cell.clips.push(clip);
          cell.totalCount++;
          if (clip.ground_truth === 'actionable') {
            cell.actionableCount++;
          }
          if (clip.alerted_v1 === 'yes') {
            cell.v1Alerts++;
          }
          if (clip.alerted_v2 === 'yes') {
            cell.v2Alerts++;
          }
          if (clip.alerted_v3 === 'yes') {
            cell.v3Alerts++;
          }
        }
      }
    });

    return grid;
  }, [filteredClips]);

  // Error Distribution Grid (FP + FN)
  const timeErrorGrid = useMemo(() => {
    const models = ['v1', 'v2', 'v3'];
    const grid: {
      [model: string]: {
        [bucketId: string]: { fp: number; fn: number; totalErrors: number };
      };
    } = {};

    models.forEach((m) => {
      grid[m] = {};
      timeBuckets.forEach((b) => {
        grid[m][b.id] = { fp: 0, fn: 0, totalErrors: 0 };
      });
    });

    filteredClips.forEach((clip) => {
      const hour = getHour(clip.timestamp_start);
      const bucket = getTimeBucket(hour);

      models.forEach((m) => {
        const alerted = clip[`alerted_${m}` as keyof ClipData] === 'yes';
        const isActionable = clip.ground_truth === 'actionable';
        const isBenign = clip.ground_truth === 'benign';

        let isError = false;
        if (alerted && isBenign) {
          grid[m][bucket].fp++;
          isError = true;
        }
        if (!alerted && isActionable) {
          grid[m][bucket].fn++;
          isError = true;
        }
        if (isError) {
          grid[m][bucket].totalErrors++;
        }
      });
    });

    return grid;
  }, [filteredClips]);

  const getErrorColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 text-slate-300 dark:text-slate-700';
    if (count <= 2) return 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-700 dark:text-amber-400';
    if (count <= 5) return 'bg-orange-100 dark:bg-orange-900/40 border border-orange-300 dark:border-orange-800/60 text-orange-800 dark:text-orange-300 font-semibold';
    if (count <= 10) return 'bg-rose-100 dark:bg-rose-900/60 border border-rose-300 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 font-bold';
    return 'bg-rose-500 dark:bg-rose-700 border border-rose-600 dark:border-rose-500 text-white font-black';
  };

  const getCellMetricCount = (cellData: {
    actionableCount: number;
    v1Alerts: number;
    v2Alerts: number;
    v3Alerts: number;
    totalCount: number;
  }) => {
    switch (heatmapMetric) {
      case 'actionable':
        return cellData.actionableCount;
      case 'v1':
        return cellData.v1Alerts;
      case 'v2':
        return cellData.v2Alerts;
      case 'v3':
        return cellData.v3Alerts;
      case 'total':
        return cellData.totalCount;
    }
  };

  const defaultHotspot = useMemo(() => {
    let maxCount = -1;
    let hottest: { locId: string; bucketId: string } | null = null;

    locations.forEach((loc) => {
      timeBuckets.forEach((bucket) => {
        const cell = heatmapGrid[loc.id][bucket.id];
        const count = getCellMetricCount(cell);
        if (count > maxCount) {
          maxCount = count;
          hottest = { locId: loc.id, bucketId: bucket.id };
        }
      });
    });

    return hottest || { locId: locations[0].id, bucketId: timeBuckets[0].id };
  }, [heatmapGrid, heatmapMetric]);

  const getCellColorClass = (count: number) => {
    if (count === 0) {
      return 'bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 text-slate-300 dark:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300';
    }
    
    if (heatmapMetric === 'total') {
      if (count === 1) return 'bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100';
      if (count === 2) return 'bg-indigo-100 dark:bg-indigo-950/45 border border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-200';
      if (count <= 4) return 'bg-indigo-200 dark:bg-indigo-900/70 border border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-300 font-bold';
      return 'bg-indigo-600 dark:bg-indigo-700 border border-indigo-700 dark:border-indigo-650 text-white hover:bg-indigo-700 font-bold';
    }

    if (count === 1) {
      return 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-amber-800 dark:text-amber-400 hover:bg-amber-100 hover:border-amber-200';
    }
    if (count === 2) {
      return 'bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 hover:bg-amber-200 hover:border-amber-405 font-semibold';
    }
    if (count === 3) {
      return 'bg-rose-100 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/35 text-rose-800 dark:text-rose-400 hover:bg-rose-200 hover:border-rose-300 font-bold';
    }
    if (count === 4) {
      return 'bg-rose-200 dark:bg-rose-900/55 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 hover:bg-rose-300 hover:border-rose-400 font-bold';
    }
    return 'bg-rose-600 dark:bg-rose-700 border border-rose-700 dark:border-rose-600 text-white hover:bg-rose-700 font-black';
  };

  // Timeline Data: compute metrics grouped by Date
  const timelineData = useMemo(() => {
    const groups: { [key: string]: ClipData[] } = {};
    filteredClips.forEach((clip) => {
      const dateStr = clip.timestamp_start.substring(0, 10);
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(clip);
    });

    const sortedDates = Object.keys(groups).sort();

    return sortedDates.map((dateStr) => {
      const dayClips = groups[dateStr];
      const mV1 = calculateMetrics(dayClips, 'v1');
      const mV2 = calculateMetrics(dayClips, 'v2');
      const mV3 = calculateMetrics(dayClips, 'v3');

      let displayDate = dateStr;
      try {
        const d = new Date(dateStr);
        displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      } catch (e) {}

      return {
        date: dateStr,
        displayDate,
        totalClips: dayClips.length,
        // Metrics scaled to percentage
        accuracy_v1: Math.round(mV1.accuracy * 100),
        precision_v1: Math.round(mV1.precision * 100),
        recall_v1: Math.round(mV1.recall * 100),
        
        accuracy_v2: Math.round(mV2.accuracy * 100),
        precision_v2: Math.round(mV2.precision * 100),
        recall_v2: Math.round(mV2.recall * 100),

        accuracy_v3: Math.round(mV3.accuracy * 100),
        precision_v3: Math.round(mV3.precision * 100),
        recall_v3: Math.round(mV3.recall * 100),
      };
    });
  }, [filteredClips]);

  // Correlation Matrix / Alert Overlap (Jaccard Index)
  const correlationData = useMemo(() => {
    const models = ['v1', 'v2', 'v3'] as const;
    const data = [];
    
    // Helper to calculate Jaccard index of alerts between two models
    const getJaccard = (m1: 'v1' | 'v2' | 'v3', m2: 'v1' | 'v2' | 'v3') => {
      let intersection = 0;
      let union = 0;
      filteredClips.forEach(c => {
        const a1 = c[`alerted_${m1}`] === 'yes';
        const a2 = c[`alerted_${m2}`] === 'yes';
        if (a1 && a2) intersection++;
        if (a1 || a2) union++;
      });
      return union === 0 ? 0 : Math.round((intersection / union) * 100);
    };

    for (let i = 0; i < models.length; i++) {
      for (let j = 0; j < models.length; j++) {
        data.push({
          x: models[j].toUpperCase(),
          y: models[i].toUpperCase(),
          value: getJaccard(models[i], models[j]),
        });
      }
    }
    return data;
  }, [filteredClips]);

  // Custom tooltips
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xl border border-slate-700 text-xs max-w-sm">
          <div className="font-bold flex items-center justify-between gap-4 mb-1">
            <span>{data.id}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                data.ground_truth === 'actionable'
                  ? 'bg-rose-500/20 text-rose-400'
                  : data.ground_truth === 'benign'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {data.ground_truth}
            </span>
          </div>
          <p className="text-slate-300 font-medium capitalize mb-2">{data.name}</p>
          <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-800 text-[10px]">
            <div>
              <span className="text-slate-400 block">V1 Anomaly:</span>
              <span className="font-mono font-bold text-slate-300">{data.v1.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">V2 Anomaly:</span>
              <span className="font-mono font-bold text-indigo-400">{data.v2.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">V3 (Edge):</span>
              <span className="font-mono font-bold text-emerald-400">{data.v3.toFixed(2)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const getVal = (v: any) => (v !== undefined && v !== null ? v : null);
      
      const v1Val = getVal(payload.find((p: any) => p.dataKey?.endsWith('_v1'))?.value);
      const v2Val = getVal(payload.find((p: any) => p.dataKey?.endsWith('_v2'))?.value);
      const v3Val = getVal(payload.find((p: any) => p.dataKey?.endsWith('_v3'))?.value);

      return (
        <div className="bg-slate-900 text-white rounded-xl p-3.5 shadow-xl border border-slate-700 text-xs min-w-[240px]">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <CalendarDays className="w-3.5 h-3.5" />
              {data.displayDate}
            </span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
              {data.totalClips} {data.totalClips === 1 ? 'clip' : 'clips'}
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            {v1Val !== null && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                  Model V1:
                </span>
                <strong className="font-mono">{v1Val}%</strong>
              </div>
            )}
            {v2Val !== null && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                  Model V2:
                </span>
                <div className="flex items-center gap-2">
                  <strong className="font-semibold font-mono text-indigo-300">{v2Val}%</strong>
                  {v1Val !== null && (
                    <span className={`text-[10px] font-mono w-10 text-right ${v2Val >= v1Val ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {v2Val >= v1Val ? '+' : ''}{(v2Val - v1Val).toFixed(1)}pt
                    </span>
                  )}
                </div>
              </div>
            )}
            {v3Val !== null && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Model V3:
                </span>
                <div className="flex items-center gap-2">
                  <strong className="font-bold font-mono text-emerald-400">{v3Val}%</strong>
                  {v1Val !== null && (
                    <span className={`text-[10px] font-mono w-10 text-right ${v3Val >= v1Val ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {v3Val >= v1Val ? '+' : ''}{(v3Val - v1Val).toFixed(1)}pt
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomOverlapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xl border border-slate-700 text-xs text-center z-50">
          <span className="text-slate-400 block mb-1">Alert Agreement</span>
          <div className="font-mono font-bold text-lg text-indigo-400 mb-1">{data.value}%</div>
          <span className="text-slate-300">Between Model {data.x} & {data.y}</span>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const v1Val = payload.find((p: any) => p.dataKey === 'V1')?.value || 0;
      return (
        <div className="bg-slate-900 text-white rounded-lg p-3 shadow-xl border border-slate-700 text-xs z-50 min-w-[220px]">
          <span className="text-slate-400 block mb-2 font-bold uppercase tracking-wider">{label}</span>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              const diff = (entry.value - v1Val).toFixed(1);
              const isV1 = entry.dataKey === 'V1';
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    <span className="text-slate-300 whitespace-nowrap">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{entry.value}%</span>
                    {isV1 ? (
                      <span className="text-[10px] font-mono text-slate-500 w-12 text-right">Base</span>
                    ) : (
                      <span className={`text-[10px] font-mono w-12 text-right ${entry.value >= v1Val ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {entry.value >= v1Val ? '+' : ''}{diff}pt
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" id="visualizations-container-wrapper">
      
      {/* Dynamic Evolution Over Time Plot */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm md:hover:shadow-md transition-shadow" id="metric-trend-timeline">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <LineIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-slate-800 dark:text-white">Performance Over Time</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Hover over points to see exact metric statistics per date slice</p>
            </div>
          </div>

          {/* Interactive Metric Selection Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-805 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
            {(['accuracy', 'precision', 'recall'] as const).map((metric) => (
              <button
                key={metric}
                id={`timeline-tab-${metric}`}
                onClick={() => setSelectedTimelineMetric(metric)}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  selectedTimelineMetric === metric
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[240px] w-full">
          {timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{ top: 10, right: 30, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTimelineTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                
                <Line
                  name="Model V1 (Baseline)"
                  type="monotone"
                  dataKey={`${selectedTimelineMetric}_v1`}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                  dot={{ r: 3 }}
                  strokeDasharray="4 4"
                />
                <Line
                  name="Model V2 (Fine-Tuned)"
                  type="monotone"
                  dataKey={`${selectedTimelineMetric}_v2`}
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4 }}
                />
                <Line
                  name="Model V3 (Edge Optimized)"
                  type="monotone"
                  dataKey={`${selectedTimelineMetric}_v3`}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
              No evaluation data points available inside the selected date range.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="visualizations-container">
        {/* Chart 1: Core Performance Metrics */}
        <div className="col-span-1 lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm md:hover:shadow-md transition-shadow flex flex-col" id="performance-chart">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-display font-bold text-slate-800 dark:text-white">Metrics Comparison</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Percentage scores for all models over the active slice</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 rounded-xl p-2.5">
              <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Revised V2 vs Baseline
              </div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Precision Change</span>
                <span className={`font-bold font-mono ${metricsV2.precision >= metricsV1.precision ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {metricsV2.precision >= metricsV1.precision ? '+' : ''}{((metricsV2.precision - metricsV1.precision) * 100).toFixed(1)}pt
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Recall Change</span>
                <span className={`font-bold font-mono ${metricsV2.recall >= metricsV1.recall ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {metricsV2.recall >= metricsV1.recall ? '+' : ''}{((metricsV2.recall - metricsV1.recall) * 100).toFixed(1)}pt
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/60 rounded-xl p-2.5">
              <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Revised V3 vs Baseline
              </div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Precision Change</span>
                <span className={`font-bold font-mono ${metricsV3.precision >= metricsV1.precision ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {metricsV3.precision >= metricsV1.precision ? '+' : ''}{((metricsV3.precision - metricsV1.precision) * 100).toFixed(1)}pt
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Recall Change</span>
                <span className={`font-bold font-mono ${metricsV3.recall >= metricsV1.recall ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {metricsV3.recall >= metricsV1.recall ? '+' : ''}{((metricsV3.recall - metricsV1.recall) * 100).toFixed(1)}pt
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metricsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar name="Model V1 (Baseline)" dataKey="V1" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar name="Model V2 (Fine-Tuned)" dataKey="V2" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar name="Model V3 (Edge Opt)" dataKey="V3" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Decision Boundary Separation Scatter */}
        <div className="col-span-1 lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm md:hover:shadow-md transition-shadow" id="boundary-separation-chart">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-sm font-display font-bold text-slate-800 dark:text-white">Anomaly Score Distribution</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Compare individual clip anomaly scores with respective thresholds</p>
            </div>
          </div>

          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="v1"
                  name="V1 Score"
                  domain={[0.5, 1.0]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{ value: 'Model V1 Score Threshold (0.80)', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  type="number"
                  dataKey="v2"
                  name="V2 Score"
                  domain={[0.5, 1.0]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  label={{ value: 'Model V2 Score Threshold (0.82)', angle: -90, position: 'insideLeft', offset: 5, fontSize: 11, fill: '#94a3b8' }}
                />
                <ZAxis type="number" range={[50, 50]} />
                <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#e2e8f0' }} />
                
                {/* Reference thresholds */}
                <ReferenceLine x={0.8} stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'v1 limit', position: 'top', fill: '#94a3b8', fontSize: 9 }} />
                <ReferenceLine y={0.82} stroke="#818cf8" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'v2 limit', position: 'right', fill: '#818cf8', fontSize: 9 }} />

                <Scatter name="Actionable Hazards" data={actionableScatter} fill="#ef4444" />
                <Scatter name="Benign Shifts" data={benignScatter} fill="#10b981" />
                <Scatter name="Unclear" data={unclearScatter} fill="#94a3b8" />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Model Alert Correlation Matrix (Jaccard Index) */}
        <div className="col-span-1 lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm md:hover:shadow-md transition-shadow" id="correlation-matrix-chart">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-sm font-display font-bold text-slate-800 dark:text-white">Alert Correlation Matrix</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Jaccard similarity index measuring performance overlap. Larger bubbles indicate high agreement between models when triggering anomaly events.</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2 mt-4 leading-relaxed max-w-lg">
                <p>
                  <strong>Why it matters:</strong> Low overlap between Baseline (V1) and Tuned (V2/V3) models indicates that temporal masking has successfully suppressed previous nuisance alerts or surfaced previously missed fragmented anomalies.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded font-mono text-[10px]">&gt; 80%: High Agreement</span>
                  <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-mono text-[10px]">&lt; 40%: Independent Behavior</span>
                </div>
              </div>
            </div>
            <div className="h-[280px] w-full md:w-[400px] shrink-0 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} horizontal={false} />
                  <XAxis 
                    type="category" 
                    dataKey="x" 
                    name="Model" 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    type="category" 
                    dataKey="y" 
                    name="Model" 
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <ZAxis type="number" dataKey="value" range={[200, 1500]} name="Overlap" />
                  <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#e2e8f0' }} content={<CustomOverlapTooltip />} />
                  <Scatter data={correlationData} fill="#4f46e5" fillOpacity={0.7}>
                    <LabelList 
                      dataKey="value" 
                      position="center" 
                      fill="#ffffff" 
                      fontSize={11} 
                      fontWeight="bold" 
                      formatter={(val: number) => `${val}%`} 
                    />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Speed Visual Section */}
        <div className="col-span-1 lg:col-span-12 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6" id="latency-strip">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Alert Latency</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">Average response speed to trigger alert for true actionable events (sec, lower is better)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 justify-end w-full md:w-auto">
            <div className="flex items-center gap-4 text-xs font-sans">
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Model V1 Latency</span>
                <span className="text-sm font-mono font-medium text-slate-500 dark:text-slate-400">
                  {avgLatencyV1 ? `${avgLatencyV1.toFixed(2)}s` : 'N/A'}
                </span>
              </div>
              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider block">Model V2 Latency</span>
                <span className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {avgLatencyV2 ? `${avgLatencyV2.toFixed(2)}s` : 'N/A'}
                </span>
              </div>
              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
              <div className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                <span className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider block">Model V3 Latency</span>
                <span className="text-base font-mono font-black block">
                  {avgLatencyV3 ? `${avgLatencyV3.toFixed(2)}s` : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-end">
              {avgLatencyV1 && avgLatencyV3 ? (
                <span className="text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-lg block">
                  Model V3 is {(((avgLatencyV1 - avgLatencyV3) / avgLatencyV1) * 100).toFixed(1)}% Faster
                </span>
              ) : null}
            </div>
          </div>
        </div>

      </div>

      {/* Spatio-Temporal Anomaly Heatmap */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm md:hover:shadow-md transition-shadow" id="spatio-temporal-heatmap">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
              <Sparkles className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-slate-800 dark:text-white">Detection Heatmap</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Identify hotspots in locations over time</p>
            </div>
          </div>

          {/* Interactive Metric Selection Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full lg:w-auto overflow-x-auto select-none scrollbar-none">
            <div className="flex gap-1 min-w-[380px] w-full">
              {[
                { key: 'actionable' as const, label: 'True Hazards', color: 'text-rose-600' },
                { key: 'v3' as const, label: 'V3 (Edge) Alerts', color: 'text-indigo-600' },
                { key: 'v2' as const, label: 'V2 (Tuned) Alerts', color: 'text-indigo-600' },
                { key: 'v1' as const, label: 'V1 (Baseline) Alerts', color: 'text-amber-600' },
                { key: 'total' as const, label: 'Total Clips', color: 'text-sky-600' },
              ].map((m) => {
                const isActive = heatmapMetric === m.key;
                return (
                  <button
                    key={m.key}
                    id={`heatmap-metric-tab-${m.key}`}
                    onClick={() => {
                      setHeatmapMetric(m.key);
                      setHoveredCell(null);
                    }}
                    className={`flex-1 px-3 py-1.5 text-center text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/40 dark:border-slate-650 font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Heatmap Matrix Grid */}
          <div className="xl:col-span-8 space-y-4">
            <div className="overflow-x-auto pb-4 scrollbar-thin">
              <div className="min-w-[700px] space-y-2.5">
                
                {/* Time bands header row */}
                <div className="grid grid-cols-12 gap-2 text-center pb-2 border-b border-slate-100 dark:border-slate-800 items-center">
                  <div className="col-span-3 text-left font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                    Location Corridor / Dock
                  </div>
                  <div className="col-span-9 grid grid-cols-6 gap-2">
                    {timeBuckets.map((bucket) => {
                      const isActiveCellBucket = (hoveredCell || defaultHotspot).bucketId === bucket.id;
                      return (
                        <div 
                          key={bucket.id} 
                          className={`text-center py-1.5 px-1 rounded-xl transition-all duration-150 ${
                            isActiveCellBucket ? 'bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]' : ''
                          }`}
                        >
                          <div className="text-base leading-none filter saturate-100">{bucket.icon}</div>
                          <div className={`text-[11px] font-sans font-semibold mt-1 leading-none ${isActiveCellBucket ? 'text-indigo-650 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                            {bucket.label}
                          </div>
                          <div className="text-[8.5px] font-mono text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter font-semibold">
                            {bucket.hours}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grid Rows for Locations */}
                <div className="space-y-2 pt-1 font-sans">
                  {locations.map((loc) => {
                    const activeCellCoord = hoveredCell || defaultHotspot;
                    const isLocationActive = activeCellCoord.locId === loc.id;
                    return (
                      <div 
                        key={loc.id} 
                        className={`grid grid-cols-12 gap-2 items-center rounded-2xl p-1.5 transition-all ${
                          isLocationActive ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                        }`}
                      >
                        {/* Row Y-Axis label */}
                        <div className="col-span-3 pr-2 flex flex-col justify-center">
                          <span className={`text-xs font-semibold leading-tight flex items-center gap-1.5 ${isLocationActive ? 'text-indigo-650 dark:text-indigo-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                            {isLocationActive && <MapPin className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" />}
                            {loc.name}
                          </span>
                          <span className="text-[9px] font-mono font-medium text-slate-400 dark:text-slate-500 block tracking-tight mt-0.5">
                            {loc.id} • {loc.zone}
                          </span>
                        </div>

                        {/* 6 Heatmap Columns */}
                        <div className="col-span-9 grid grid-cols-6 gap-2">
                          {timeBuckets.map((bucket) => {
                            const cellData = heatmapGrid[loc.id][bucket.id];
                            const count = getCellMetricCount(cellData);
                            const isCellActive = activeCellCoord.locId === loc.id && activeCellCoord.bucketId === bucket.id;
                            const cellBgClass = getCellColorClass(count);

                            return (
                              <div
                                key={bucket.id}
                                id={`heatmap-cell-${loc.id}-${bucket.id}`}
                                onMouseEnter={() => setHoveredCell({ locId: loc.id, bucketId: bucket.id })}
                                onClick={() => setHoveredCell({ locId: loc.id, bucketId: bucket.id })}
                                className={`h-12 rounded-xl flex flex-col items-center justify-center relative cursor-pointer group select-none transition-all duration-150 ${cellBgClass} ${
                                  isCellActive ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-[1.03] z-10 shadow-sm' : ''
                                }`}
                              >
                                <span className="text-xs font-mono font-bold leading-none">{count}</span>
                                <span className="text-[8px] uppercase font-mono tracking-tighter opacity-70 mt-1">
                                  {count === 1 ? 'event' : 'events'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Intensity legend */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-450 dark:text-slate-500">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Hover or tap cells to inspect alerts, false positive structures, and schedules instantly.</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold">MIN (0)</span>
                <span className="w-5 h-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 rounded-md inline-block"></span>
                <span className="w-5 h-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-slate-800 rounded-md inline-block"></span>
                <span className="w-5 h-3.5 bg-amber-200 dark:bg-amber-950/40 border border-amber-300 dark:border-slate-800 rounded-md inline-block"></span>
                <span className="w-5 h-3.5 bg-rose-100 dark:bg-rose-950/20 border border-rose-200 dark:border-slate-800 rounded-md inline-block"></span>
                <span className="w-5 h-3.5 bg-rose-200 dark:bg-rose-900/55 border border-rose-300 dark:border-slate-800 rounded-md inline-block"></span>
                <span className="w-5 h-3.5 bg-rose-600 dark:bg-rose-700 border border-rose-700 dark:border-slate-800 rounded-md inline-block"></span>
                <span className="font-mono text-[10px] font-bold">MAX (5+)</span>
              </div>
            </div>
          </div>

          {/* Active cell detail inspector panel */}
          <div className="xl:col-span-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs" id="spatial-heatmap-inspector">
            {(() => {
              const activeCellCoord = hoveredCell || defaultHotspot;
              const activeLoc = locations.find(l => l.id === activeCellCoord.locId);
              const activeBucket = timeBuckets.find(b => b.id === activeCellCoord.bucketId);
              const activeCellData = activeLoc && activeBucket ? heatmapGrid[activeLoc.id][activeBucket.id] : null;

              return (
                <>
                  <div className="border-b border-slate-200 dark:border-slate-800/80 pb-3">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
                      {hoveredCell ? 'Inspection' : 'Hotspot'}
                    </span>
                    <h4 className="text-sm font-display font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      {activeLoc?.name}
                    </h4>
                    <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter">
                      Camera {activeCellCoord.locId} • {activeLoc?.zone}
                    </p>
                  </div>

                  {/* Time band detail summary card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{activeBucket?.icon}</span>
                      <div>
                        <span className="font-semibold block text-slate-700 dark:text-slate-300">{activeBucket?.label}</span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{activeBucket?.hours}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-bold uppercase block tracking-wider text-slate-400 dark:text-slate-500">Total clips</span>
                      <strong className="text-sm font-semibold text-slate-800 dark:text-white font-mono">
                        {activeCellData?.totalCount || 0}
                      </strong>
                    </div>
                  </div>

                  {/* Micro comparison matrix inside cell */}
                  <div className="space-y-2 pt-1 font-sans">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Detection Ratios
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-700 p-2 rounded-xl">
                        <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-tight">Validated Hazards</span>
                        <strong className="text-sm font-mono mt-0.5 text-rose-600 dark:text-rose-400 block">
                          {activeCellData?.actionableCount || 0}
                        </strong>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-700 p-2 rounded-xl">
                        <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-tight">V3 (Edge) Alerts</span>
                        <strong className="text-sm font-mono mt-0.5 text-emerald-600 dark:text-emerald-400 block">
                          {activeCellData?.v3Alerts || 0}
                        </strong>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-700 p-2 rounded-xl">
                        <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-tight font-semibold">V2 (Tuned) Alerts</span>
                        <strong className="text-sm font-mono mt-0.5 text-indigo-500 dark:text-indigo-400 block">
                          {activeCellData?.v2Alerts || 0}
                        </strong>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-700 p-2 rounded-xl">
                        <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-tight">V1 (Baseline) Alerts</span>
                        <strong className="text-sm font-mono mt-0.5 text-slate-400 dark:text-slate-400 block">
                          {activeCellData?.v1Alerts || 0}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* List of clips matching this spatiotemporal coordinate */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 font-sans">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Events Captured ({activeCellData?.clips.length || 0})
                    </span>

                    {activeCellData?.clips && activeCellData.clips.length > 0 ? (
                      <div className="max-h-[170px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                        {activeCellData.clips.map((clip) => (
                          <div 
                            key={clip.clip_id} 
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl space-y-1.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                                {clip.clip_id}
                              </span>
                              <span className="font-mono text-slate-400 dark:text-slate-500">
                                {clip.timestamp_start.substring(11, 19)}
                              </span>
                            </div>
                            
                            <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 capitalize leading-snug">
                              {clip.scenario_label.replace(/_/g, ' ')}
                            </p>

                            <div className="flex flex-wrap items-center gap-1 pt-0.5 text-[8.5px]">
                              <span className={`px-1 rounded uppercase font-bold font-mono border ${
                                clip.ground_truth === 'actionable'
                                  ? 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/35'
                                  : clip.ground_truth === 'benign'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                  : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                              }`}>
                                {clip.ground_truth}
                              </span>

                              <span className={`px-1 rounded text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 font-mono`}>
                                V1: {clip.alerted_v1 === 'yes' ? '🚨' : '✓'}
                              </span>
                              <span className={`px-1 rounded font-semibold font-mono ${
                                clip.alerted_v2 === 'yes' ? 'bg-indigo-50 dark:bg-indigo-950/25 text-indigo-700 dark:text-indigo-400 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}>
                                V2: {clip.alerted_v2 === 'yes' ? '🚨' : '✓'}
                              </span>
                              <span className={`px-1 rounded font-bold font-mono ${
                                clip.alerted_v3 === 'yes' ? 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}>
                                V3: {clip.alerted_v3 === 'yes' ? '🚨' : '✓'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center text-slate-400 dark:text-slate-500 text-[11px] italic">
                        No evaluation clips recorded under this coordinator slice.
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Time-of-Day Error Distribution Heatmap */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm md:hover:shadow-md transition-shadow mt-6" id="error-distribution-heatmap">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
              <Activity className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-slate-800 dark:text-white">Time-of-Day Error Distribution</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Distribution of model errors (False Positives + False Negatives) across shift periods</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 scrollbar-thin">
          <div className="min-w-[600px] space-y-3">
            {/* Time buckets header */}
            <div className="grid grid-cols-7 gap-2 text-center pb-2 border-b border-slate-100 dark:border-slate-800 items-end">
              <div className="col-span-1 text-left font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
                Model
              </div>
              {timeBuckets.map((bucket) => (
                <div key={bucket.id} className="text-center col-span-1">
                  <div className="text-base leading-none filter saturate-100">{bucket.icon}</div>
                  <div className="text-[10px] font-sans font-semibold mt-1 text-slate-700 dark:text-slate-300">
                    {bucket.label}
                  </div>
                  <div className="text-[8.5px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 uppercase">
                    {bucket.hours}
                  </div>
                </div>
              ))}
            </div>

            {/* Model rows */}
            {[
              { id: 'v1', name: 'Model V1 (Baseline)' },
              { id: 'v2', name: 'Model V2 (Tuned)' },
              { id: 'v3', name: 'Model V3 (Edge)' }
            ].map(model => (
              <div key={model.id} className="grid grid-cols-7 gap-2 items-center rounded-2xl p-1.5 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                <div className="col-span-1 pr-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {model.name}
                  </span>
                </div>
                {timeBuckets.map(bucket => {
                  const data = timeErrorGrid[model.id][bucket.id];
                  const colorClass = getErrorColorClass(data.totalErrors);
                  return (
                    <div key={bucket.id} className={`col-span-1 rounded-xl p-2 text-center flex flex-col items-center justify-center min-h-[48px] cursor-help transition-all ${colorClass}`} title={`FP: ${data.fp} | FN: ${data.fn}`}>
                      {data.totalErrors > 0 ? (
                        <span className="font-mono text-sm block">{data.totalErrors}</span>
                      ) : (
                        <span className="block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 opacity-50"></span>
                      )}
                      {data.totalErrors > 0 && (
                        <div className="flex gap-1.5 text-[8px] mt-0.5 opacity-80 font-mono tracking-tighter">
                          {data.fp > 0 && <span>{data.fp}FP</span>}
                          {data.fn > 0 && <span>{data.fn}FN</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

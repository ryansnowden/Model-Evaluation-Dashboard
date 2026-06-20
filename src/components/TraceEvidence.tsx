import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { IncidentTrace, ModelConfig } from '../types';

interface TraceEvidenceProps {
  traces: IncidentTrace[];
  models: ModelConfig[];
  selectedModels: string[];
  onSelectTrace: (trace: IncidentTrace) => void;
  selectedTraceId: string | null;
}

export function EvidenceFilterBar({
  traces,
  search, setSearch,
  filterGT, setFilterGT,
  filterZone, setFilterZone,
  filterTag, setFilterTag
}: {
  traces: IncidentTrace[],
  search: string, setSearch: (v: string) => void,
  filterGT: string | null, setFilterGT: (v: string | null) => void,
  filterZone: string | null, setFilterZone: (v: string | null) => void,
  filterTag: string | null, setFilterTag: (v: string | null) => void
}) {
  const uniqueGTs = useMemo(() => Array.from(new Set(traces.map(t => t.ground_truth))), [traces]);
  const uniqueZones = useMemo(() => Array.from(new Set(traces.map(t => t.zone_type))), [traces]);
  const uniqueTags = useMemo(() => Array.from(new Set(traces.flatMap(t => t.tags))), [traces]);

  const gtCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    traces.forEach(t => { counts[t.ground_truth] = (counts[t.ground_truth] || 0) + 1; });
    return counts;
  }, [traces]);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="flex items-center gap-2" style={{
        background: 'var(--bg-surface)', padding: '5px 10px', borderRadius: '100px',
        border: '1px solid var(--border-default)', minWidth: 180,
      }}>
        <Search size={13} color="var(--text-muted)" />
        <input
          type="text"
          aria-label="Search traces"
          placeholder="Search traces..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'transparent', border: 'none', color: 'var(--text-primary)',
            outline: 'none', fontSize: 12, width: '100%', fontFamily: 'var(--font-sans)',
          }}
        />
      </div>

      {/* Ground Truth filters */}
      {uniqueGTs.map(gt => (
        <button
          key={gt}
          className={`filter-pill ${filterGT === gt ? 'active' : ''}`}
          onClick={() => setFilterGT(filterGT === gt ? null : gt)}
        >
          {gt} <span className="pill-count">{gtCounts[gt] || 0}</span>
        </button>
      ))}

      {/* Zone filters */}
      {uniqueZones.map(zone => (
        <button
          key={zone}
          className={`filter-pill ${filterZone === zone ? 'active' : ''}`}
          onClick={() => setFilterZone(filterZone === zone ? null : zone)}
        >
          {zone}
        </button>
      ))}

      {/* Tag filters */}
      {uniqueTags.map(tag => {
        const cls = tag === 'true_positive' ? 'badge-pass' :
          tag === 'false_positive' ? 'badge-fail' :
          tag === 'false_negative' ? 'badge-warn' : '';
        return (
          <button
            key={tag}
            className={`filter-pill ${filterTag === tag ? 'active' : ''}`}
            onClick={() => setFilterTag(filterTag === tag ? null : tag)}
          >
            {tag.replace(/_/g, ' ')}
          </button>
        );
      })}
    </div>
  );
}

export function EvidenceTable({
  filtered,
  visibleModels,
  onSelectTrace,
  selectedTraceId
}: {
  filtered: IncidentTrace[],
  visibleModels: ModelConfig[],
  onSelectTrace: (trace: IncidentTrace) => void,
  selectedTraceId: string | null
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Trace</th>
            <th>Zone</th>
            <th>Score</th>
            <th>Ground Truth</th>
            <th>Scenario</th>
            {visibleModels.map(m => (
              <th key={m.run_id} style={{ textAlign: 'center' }}>
                <span className="flex items-center justify-center gap-1">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
                  {m.short_name}
                </span>
              </th>
            ))}
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(trace => (
            <tr
              key={trace.trace_id}
              onClick={() => onSelectTrace(trace)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectTrace(trace); }}
              tabIndex={0}
              className={selectedTraceId === trace.trace_id ? 'row-highlight' : ''}
              style={{ cursor: 'pointer' }}
            >
              <td>
                <span className="font-mono font-semibold" style={{ color: 'var(--accent)', fontSize: 12 }}>
                  {trace.trace_id}
                </span>
              </td>
              <td className="text-xs text-secondary">{trace.zone_type}</td>
              <td>
                <span className="font-mono font-semibold text-xs" style={{
                  color: trace.anomaly_score > trace.threshold ? 'var(--color-warn)' : 'var(--text-secondary)',
                }}>
                  {(trace.anomaly_score * 100).toFixed(0)}%
                </span>
              </td>
              <td>
                <span className={`badge ${
                  trace.ground_truth === 'actionable' ? 'badge-fail' :
                  trace.ground_truth === 'benign' ? 'badge-pass' : 'badge-neutral'
                }`}>
                  {trace.ground_truth}
                </span>
              </td>
              <td className="text-xs text-secondary" style={{ textTransform: 'capitalize' }}>
                {trace.scenario_label.replace(/_/g, ' ')}
              </td>
              {visibleModels.map(m => {
                const detected = trace.model_detections[m.run_id] ?? false;
                return (
                  <td key={m.run_id} style={{ textAlign: 'center' }}>
                    <span className={`agree-dot ${detected ? 'caught' : 'missed'}`}>
                      {detected ? '✓' : '✗'}
                    </span>
                  </td>
                );
              })}
              <td>
                <div className="flex gap-1">
                  {trace.tags.map(tag => {
                    const cls = tag === 'true_positive' ? 'badge-pass' :
                      tag === 'false_positive' ? 'badge-fail' :
                      tag === 'false_negative' ? 'badge-warn' : 'badge-neutral';
                    return (
                      <span key={tag} className={`badge ${cls}`} style={{ fontSize: 11, padding: '1px 5px' }}>
                        {tag === 'true_positive' ? 'TP' :
                         tag === 'false_positive' ? 'FP' :
                         tag === 'false_negative' ? 'FN' :
                         tag === 'true_negative' ? 'TN' : tag}
                      </span>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          No traces match the current filters.
        </div>
      )}
    </div>
  );
}

export default function TraceEvidence({ traces, models, selectedModels, onSelectTrace, selectedTraceId }: TraceEvidenceProps) {
  const [search, setSearch] = useState('');
  const [filterGT, setFilterGT] = useState<string | null>(null);
  const [filterZone, setFilterZone] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return traces.filter(t => {
      if (search && !t.trace_id.toLowerCase().includes(search.toLowerCase()) &&
          !t.camera_id.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterGT && t.ground_truth !== filterGT) return false;
      if (filterZone && t.zone_type !== filterZone) return false;
      if (filterTag && !t.tags.includes(filterTag)) return false;
      return true;
    }).slice(0, 100);
  }, [traces, search, filterGT, filterZone, filterTag]);

  const visibleModels = models.filter(m => selectedModels.includes(m.run_id));

  return (
    <div className="flex-col gap-3">
      <EvidenceFilterBar
        traces={traces}
        search={search} setSearch={setSearch}
        filterGT={filterGT} setFilterGT={setFilterGT}
        filterZone={filterZone} setFilterZone={setFilterZone}
        filterTag={filterTag} setFilterTag={setFilterTag}
      />
      <EvidenceTable
        filtered={filtered}
        visibleModels={visibleModels}
        onSelectTrace={onSelectTrace}
        selectedTraceId={selectedTraceId}
      />
    </div>
  );
}

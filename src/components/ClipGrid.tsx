import React, { useState, useMemo } from 'react';
import { mockTraces } from '../data/index';
import { IncidentTrace } from '../types';
import { Filter, X } from 'lucide-react';

export default function ClipGrid() {
  const [selectedTrace, setSelectedTrace] = useState<IncidentTrace | null>(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    zone_type: new Set<string>(),
    ground_truth: new Set<string>(),
    tags: new Set<string>()
  });

  // Extract unique filter options
  const uniqueZones = Array.from(new Set(mockTraces.map(t => t.zone_type)));
  const uniqueGT = Array.from(new Set(mockTraces.map(t => t.ground_truth)));
  const uniqueTags = Array.from(new Set(mockTraces.flatMap(t => t.tags)));

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const newSet = new Set(prev[category]);
      if (newSet.has(value)) newSet.delete(value);
      else newSet.add(value);
      return { ...prev, [category]: newSet };
    });
  };

  const filteredTraces = useMemo(() => {
    return mockTraces.filter(t => {
      if (filters.zone_type.size > 0 && !filters.zone_type.has(t.zone_type)) return false;
      if (filters.ground_truth.size > 0 && !filters.ground_truth.has(t.ground_truth)) return false;
      if (filters.tags.size > 0 && !t.tags.some(tag => filters.tags.has(tag))) return false;
      return true;
    });
  }, [filters]);

  const getBorderColor = (tags: string[]) => {
    if (tags.includes('true_positive')) return 'var(--color-tp)';
    if (tags.includes('false_positive')) return 'var(--color-fp)';
    if (tags.includes('false_negative')) return 'var(--color-fn)';
    return 'var(--border-color)';
  };

  return (
    <div className="clip-grid-layout" style={{ height: 'calc(100vh - 120px)' }}>
      
      {/* Faceted Filter Sidebar */}
      <div className="filter-sidebar" style={{ width: '260px', flexShrink: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Filter size={16} color="var(--text-secondary)" />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>FILTERS</h3>
        </div>

        <div className="mb-6">
          <div className="sidebar-group-title" style={{ padding: 0 }}>ZONE TYPE</div>
          {uniqueZones.map(z => (
            <div key={z} className="flex items-center gap-2 mt-2 cursor-pointer" onClick={() => toggleFilter('zone_type', z)}>
              <input type="checkbox" readOnly checked={filters.zone_type.has(z)} />
              <span style={{ fontSize: '13px' }}>{z}</span>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="sidebar-group-title" style={{ padding: 0 }}>GROUND TRUTH</div>
          {uniqueGT.map(gt => (
            <div key={gt} className="flex items-center gap-2 mt-2 cursor-pointer" onClick={() => toggleFilter('ground_truth', gt)}>
              <input type="checkbox" readOnly checked={filters.ground_truth.has(gt)} />
              <span style={{ fontSize: '13px' }}>{gt}</span>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <div className="sidebar-group-title" style={{ padding: 0 }}>TAGS (TP/FP/FN)</div>
          {uniqueTags.map(tag => (
            <div key={tag} className="flex items-center gap-2 mt-2 cursor-pointer" onClick={() => toggleFilter('tags', tag)}>
              <input type="checkbox" readOnly checked={filters.tags.has(tag)} />
              <span style={{ fontSize: '13px' }}>{tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="clip-grid-content">
        {filteredTraces.map(trace => (
          <div 
            key={trace.trace_id} 
            className="clip-card"
            style={{ borderLeft: "4px solid " + getBorderColor(trace.tags) }}
            onClick={() => setSelectedTrace(trace)}
          >
            <div className="clip-thumbnail" style={{ backgroundColor: trace.thumbnail_color }}>
              <div className="clip-overlay-score">
                {(trace.anomaly_score * 100).toFixed(1)}%
              </div>
            </div>
            <div className="clip-details flex-col gap-2">
              <div className="clip-title">{trace.trace_id}</div>
              <div className="clip-meta">{trace.zone_type} | {trace.camera_id}</div>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                <span className="tag" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                  {trace.ground_truth}
                </span>
                {trace.tags.map(tag => (
                  <span key={tag} className={"tag " + (tag === 'true_positive' ? 'tp' : tag === 'false_positive' ? 'fp' : tag === 'false_negative' ? 'fn' : '')}>
                    {tag.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredTraces.length === 0 && (
          <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>No traces match the selected filters.</div>
        )}
      </div>

      {/* Detail Modal Overlay */}
      {selectedTrace && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ width: '80%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title" style={{ margin: 0 }}>Trace Details: {selectedTrace.trace_id}</h2>
              <button className="btn" onClick={() => setSelectedTrace(null)}><X size={16} /></button>
            </div>
            
            <div className="flex gap-4">
              <div style={{ flex: 1 }}>
                <div style={{ height: '300px', backgroundColor: selectedTrace.thumbnail_color, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '48px', color: '#fff', opacity: 0.5 }}>Video Player Placeholder</span>
                </div>
              </div>
              <div style={{ flex: 1 }} className="flex-col gap-4">
                <div className="card" style={{ marginBottom: 0 }}>
                  <h3 className="card-title" style={{ fontSize: '14px', marginBottom: '8px' }}>Metadata</h3>
                  <table style={{ fontSize: '13px' }}>
                    <tbody>
                      <tr><td style={{ padding: '4px' }}>Camera</td><td style={{ padding: '4px', fontWeight: 'bold' }}>{selectedTrace.camera_id}</td></tr>
                      <tr><td style={{ padding: '4px' }}>Zone</td><td style={{ padding: '4px', fontWeight: 'bold' }}>{selectedTrace.zone_type}</td></tr>
                      <tr><td style={{ padding: '4px' }}>Time Band</td><td style={{ padding: '4px', fontWeight: 'bold' }}>{selectedTrace.time_band}</td></tr>
                      <tr><td style={{ padding: '4px' }}>Scenario</td><td style={{ padding: '4px', fontWeight: 'bold' }}>{selectedTrace.scenario_label}</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="card" style={{ marginBottom: 0 }}>
                  <h3 className="card-title" style={{ fontSize: '14px', marginBottom: '8px' }}>Labels</h3>
                  <div className="flex gap-2">
                    <span className="tag" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', padding: '4px 8px' }}>{selectedTrace.ground_truth}</span>
                    {selectedTrace.tags.map(tag => (
                      <span key={tag} className={"tag " + (tag === 'true_positive' ? 'tp' : tag === 'false_positive' ? 'fp' : tag === 'false_negative' ? 'fn' : '')} style={{ padding: '4px 8px' }}>
                        {tag.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

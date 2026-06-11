import React from 'react';
import { mockTraces } from '../data/index';

export default function CameraSessionsPage() {
  // Group traces by camera
  const cameras = Array.from(new Set(mockTraces.map(t => t.camera_id)));

  return (
    <div className="card flex-col gap-4">
      <h2 className="card-title">Camera Sessions</h2>
      
      <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
        {cameras.map(cam => {
          const camTraces = mockTraces.filter(t => t.camera_id === cam);
          const fps = camTraces.filter(t => t.tags.includes('false_positive')).length;
          const fns = camTraces.filter(t => t.tags.includes('false_negative')).length;
          
          return (
            <div key={cam} className="card" style={{ flex: '1 1 300px', marginBottom: 0 }}>
              <div className="flex justify-between items-center mb-2">
                <h3 style={{ margin: 0, fontSize: '16px' }}>{cam}</h3>
                <span className="tag" style={{ background: 'var(--bg-hover)' }}>{camTraces.length} Traces</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>
                Zone: {camTraces[0].zone_type}
              </div>
              
              <div className="flex justify-between" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div className="flex-col">
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>False Positives</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-fp)' }}>{fps}</span>
                </div>
                <div className="flex-col">
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>False Negatives</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--color-fn)' }}>{fns}</span>
                </div>
                <div className="flex-col">
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Avg Confirm</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {((camTraces.filter(t => t.operator_action === 'confirmed').length / camTraces.length) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { mockSlices } from '../data/index';

export default function SlicesPage() {
  return (
    <div className="card">
      <h2 className="card-title">Benchmark Slices</h2>
      <table>
        <thead>
          <tr>
            <th>Slice ID</th>
            <th>Name</th>
            <th>Track</th>
            <th>Purpose</th>
            <th>Cameras</th>
            <th>Hours</th>
            <th>Events</th>
          </tr>
        </thead>
        <tbody>
          {mockSlices.map(slice => (
            <tr key={slice.slice_id}>
              <td style={{ fontWeight: 600 }}>{slice.slice_id}</td>
              <td>{slice.name}</td>
              <td><span className="tag" style={{ background: 'var(--bg-hover)' }}>{slice.track}</span></td>
              <td style={{ color: 'var(--text-secondary)' }}>{slice.purpose}</td>
              <td>{slice.num_cameras}</td>
              <td>{slice.hours_of_video}h</td>
              <td>{slice.total_events}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

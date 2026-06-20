import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, XCircle, AlertTriangle, Shield, User, FileText, Save } from 'lucide-react';
import { GateRequirement } from '../types';

interface GateDetailPanelProps {
  gate: GateRequirement | null;
  onClose: () => void;
  onSave: (gateId: string, reviewStatus: 'pending' | 'approved' | 'rejected', comment: string) => void;
}

export default function GateDetailPanel({ gate, onClose, onSave }: GateDetailPanelProps) {
  if (!gate) return null;

  const [reviewStatus, setReviewStatus] = useState<'pending' | 'approved' | 'rejected'>(gate.review_status);
  const [comment, setComment] = useState<string>(gate.comment || '');

  const handleSave = () => {
    onSave(gate.id, reviewStatus, comment);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={16} color="var(--color-pass)" />;
      case 'fail':
        return <XCircle size={16} color="var(--color-fail)" />;
      case 'warning':
      default:
        return <AlertTriangle size={16} color="var(--color-warn)" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="detail-panel"
        initial={{ x: 520 }}
        animate={{ x: 0 }}
        exit={{ x: 520 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="detail-header">
          <div>
            <div className="flex items-center gap-2">
              <Shield size={16} color="var(--accent)" />
              <div className="font-sans font-bold text-sm text-secondary uppercase tracking-wider">Gate Review</div>
            </div>
            <h3 className="font-sans font-bold text-lg" style={{ marginTop: 4, color: 'var(--text-primary)' }}>
              {gate.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="detail-body flex-col gap-5">
          {/* Status & Track row */}
          <div className="flex gap-3 flex-wrap">
            <div className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: 10 }}>
              Track: {gate.track}
            </div>
            <div
              className={`badge ${
                gate.status === 'pass' ? 'badge-pass' :
                gate.status === 'fail' ? 'badge-fail' : 'badge-warn'
              }`}
              style={{ textTransform: 'uppercase', fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {getStatusIcon(gate.status)}
              Gate State: {gate.status}
            </div>
          </div>

          {/* Section 1: Gate Definition */}
          <div className="flex-col gap-3" style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div className="card-title" style={{ fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} color="var(--text-secondary)" /> Requirement details
            </div>

            <div className="flex-col gap-2.5">
              <div className="flex-col">
                <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>Requirement</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2 }}>{gate.requirement}</span>
              </div>

              <div className="flex gap-4" style={{ marginTop: 4 }}>
                <div className="flex-1 flex-col">
                  <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>Threshold</span>
                  <span className="font-mono" style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{gate.threshold}</span>
                </div>
                <div className="flex-1 flex-col">
                  <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>Actual Value</span>
                  <span className="font-mono font-bold" style={{
                    fontSize: 14,
                    color: gate.status === 'pass' ? 'var(--color-pass)' :
                           gate.status === 'fail' ? 'var(--color-fail)' : 'var(--color-warn)',
                    marginTop: 2
                  }}>{gate.actual_value}</span>
                </div>
              </div>

              <div className="flex-col" style={{ marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>Measurement Evidence</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic', display: 'block', lineHeight: 1.4 }}>
                  "{gate.evidence}"
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Review Actions */}
          <div className="flex-col gap-4" style={{ background: 'var(--bg-elevated)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div className="card-title" style={{ fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} color="var(--accent)" /> Override & Sign-off
            </div>

            <div className="flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-secondary" style={{ fontSize: 12 }}>Assigned Reviewer</span>
                <span className="font-semibold" style={{ fontSize: 12, color: 'var(--text-primary)' }}>{gate.reviewer}</span>
              </div>

              {/* Status Buttons */}
              <div className="flex-col gap-2">
                <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>Set Review Status</span>
                <div className="flex gap-2" style={{ marginTop: 4 }}>
                  {(['pending', 'approved', 'rejected'] as const).map(status => {
                    const isActive = reviewStatus === status;
                    let activeStyle = {};
                    if (isActive) {
                      if (status === 'approved') activeStyle = { background: 'var(--color-pass)', color: 'var(--text-inverse)', border: '1px solid var(--color-pass)' };
                      else if (status === 'rejected') activeStyle = { background: 'var(--color-fail)', color: 'var(--text-primary)', border: '1px solid var(--color-fail)' };
                      else activeStyle = { background: 'var(--text-secondary)', color: 'var(--text-inverse)', border: '1px solid var(--text-secondary)' };
                    }
                    return (
                      <button
                        key={status}
                        onClick={() => setReviewStatus(status)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          transition: 'all 0.2s ease',
                          background: isActive ? undefined : 'var(--bg-hover)',
                          color: isActive ? undefined : 'var(--text-secondary)',
                          border: isActive ? undefined : '1px solid var(--border-default)',
                          ...activeStyle,
                        }}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment field */}
              <div className="flex-col gap-2">
                <span className="text-muted" style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 600 }}>Review Notes / Justification</span>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Explain why this decision is being made..."
                  style={{
                    marginTop: 4,
                    width: '100%',
                    minHeight: 90,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-strong)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    fontFamily: 'var(--font-sans)',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          background: 'var(--bg-surface)',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              background: 'var(--accent)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Save size={14} />
            Save Review
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

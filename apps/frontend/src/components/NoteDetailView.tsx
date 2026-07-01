'use client';

import { useState } from 'react';
import type { NoteDetailDto, Patient } from '@/lib/api';
import { Icon } from '@/components/Icon';
import { PatientSidebar } from '@/components/PatientSidebar';
import { formatFullDate, parseSoap, SOAP_TINTS } from '@/lib/design';

const STATUS: Record<string, { label: string; bg: string; fg: string; icon: string }> = {
  completed: { label: 'Complete', bg: '#e7eee4', fg: '#4f6b52', icon: 'verified' },
  failed: { label: 'Failed', bg: '#f3e2d8', fg: '#a85636', icon: 'error' },
  processing: { label: 'Processing', bg: '#efe6ce', fg: '#7a6326', icon: 'progress_activity' },
  pending: { label: 'Pending', bg: '#efe6ce', fg: '#7a6326', icon: 'schedule' },
};

export function NoteDetailView({ note, patient }: { note: NoteDetailDto; patient: Patient | null }) {
  const [tab, setTab] = useState<'soap' | 'transcript'>(note.processedText ? 'soap' : 'transcript');
  const status = STATUS[note.status] ?? STATUS.pending;
  const soap = parseSoap(note.processedText);
  const sourceLine = note.source === 'audio' ? `Audio${note.audioFilename ? ` · ${note.audioFilename}` : ''}` : 'Typed note';

  const copy = () => {
    const text = note.processedText || note.rawText || '';
    if (text && navigator.clipboard) navigator.clipboard.writeText(text).catch(() => undefined);
  };

  return (
    <div className="detail">
      <div className="detail__body">
        {/* topbar */}
        <div className="topbar">
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
              <span className="pill" style={{ background: status.bg, color: status.fg }}>
                <Icon name={status.icon} size={14} />
                {status.label}
              </span>
              <span className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--faint)' }}>
                {formatFullDate(note.createdAt)}
              </span>
            </div>
            <div className="topbar__title">{note.title || 'Clinical note'}</div>
            <div className="topbar__meta">
              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown patient'} · {sourceLine}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9, flex: 'none' }}>
            <button className="btn-ghost" onClick={copy}>
              <Icon name="content_copy" size={18} />
              Copy
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="tabsbar">
          <div className="tabs">
            <button className={`tab${tab === 'soap' ? ' active' : ''}`} onClick={() => setTab('soap')}>
              <Icon name="summarize" size={17} />
              SOAP note
            </button>
            <button className={`tab${tab === 'transcript' ? ' active' : ''}`} onClick={() => setTab('transcript')}>
              <Icon name="forum" size={17} />
              {note.source === 'audio' ? 'Transcript' : 'Note text'}
            </button>
          </div>
          <span className="ai-chip">
            <Icon name="auto_awesome" size={16} />
            AI-generated
          </span>
        </div>

        {/* content */}
        <div className="content">
          {tab === 'soap' ? (
            <div className="pane fade-in">
              {note.status === 'failed' && note.error ? (
                <div className="soap-banner" style={{ background: 'var(--warn-bg)', borderColor: 'var(--warn-border)' }}>
                  <Icon name="error" style={{ color: '#b0603c' }} />
                  <div>
                    <strong style={{ color: '#9a4f2e' }}>AI processing failed.</strong> The raw note was
                    preserved. <span className="error-text">{note.error}</span>
                  </div>
                </div>
              ) : (
                <div className="soap-banner">
                  <Icon name="auto_awesome" />
                  <div>
                    Structured from the visit by ScrAI. Model output —{' '}
                    <span style={{ color: 'var(--sage)', fontWeight: 600 }}>requires clinician review</span> before it
                    enters the chart.
                  </div>
                </div>
              )}

              {soap.length > 0 ? (
                soap.map((sec) => {
                  const tint = SOAP_TINTS[sec.key] ?? SOAP_TINTS.S;
                  return (
                    <div className="soap-card" key={sec.key}>
                      <div className="soap-card__head">
                        <div className="soap-badge" style={{ background: tint.bg, color: tint.fg }}>
                          {sec.key}
                        </div>
                        <div>
                          <div className="soap-card__label">{sec.label}</div>
                          <div className="soap-card__sub">{sec.sub}</div>
                        </div>
                      </div>
                      {sec.lines.map((line, i) => (
                        <div className="bullet" key={i}>
                          <span className="bullet__dot" style={{ background: tint.fg }} />
                          <div className="bullet__text">{line}</div>
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                <div className="soap-card">
                  <div className="bullet__text" style={{ whiteSpace: 'pre-wrap' }}>
                    {note.processedText || note.rawText || 'No summary was generated for this note.'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="pane fade-in">
              <div className="transcript-head">
                <Icon name="graphic_eq" size={17} />
                {note.source === 'audio' ? 'Raw transcript · Whisper' : 'Typed note'}
              </div>
              {note.audioUrl ? (
                <div style={{ marginBottom: 18 }}>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio controls src={note.audioUrl} style={{ width: '100%' }} />
                </div>
              ) : null}
              <div className="transcript-body">{note.rawText || '(no content)'}</div>
            </div>
          )}
        </div>
      </div>

      <PatientSidebar patient={patient} />
    </div>
  );
}

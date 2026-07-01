'use client';

import { useRef, useState } from 'react';
import type { Patient } from '@/lib/api';
import { Icon, Waveform } from '@/components/Icon';
import { avatarTint, initials } from '@/lib/design';

export interface GenerateInput {
  patientId: string;
  mode: 'audio' | 'text';
  file: File | null;
  text: string;
  summarize: boolean;
}

export function NoteComposer({
  patients,
  onClose,
  onGenerate,
}: {
  patients: Patient[];
  onClose: () => void;
  onGenerate: (input: GenerateInput) => void;
}) {
  const [patientId, setPatientId] = useState('');
  const [mode, setMode] = useState<'audio' | 'text'>('audio');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [summarize] = useState(true);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const disabled =
    !patientId || (mode === 'audio' && !file) || (mode === 'text' && text.trim().length === 0);

  return (
    <div className="composer">
      <div className="composer__inner fade-in">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 26 }}>
          <div>
            <div style={{ font: '600 26px/1.1 var(--font-serif)', color: 'var(--ink-heading)' }}>New clinical note</div>
            <div style={{ font: '400 14px var(--font-sans)', color: 'var(--muted)', marginTop: 5 }}>
              Capture a home visit — ScrAI transcribes the audio and drafts a structured SOAP note.
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ width: 38, height: 38, padding: 0, justifyContent: 'center', color: 'var(--muted)' }}
            aria-label="Close"
          >
            <Icon name="close" size={21} />
          </button>
        </div>

        {/* step 1 */}
        <Step n={1} label="Select patient" />
        <div style={{ display: 'grid', gap: 10, marginBottom: 28 }}>
          {patients.map((p) => {
            const active = p.id === patientId;
            const tint = avatarTint(p.id);
            return (
              <button key={p.id} className={`radio-card${active ? ' active' : ''}`} onClick={() => setPatientId(p.id)}>
                <div className="avatar" style={{ width: 40, height: 40, background: tint.bg, color: tint.fg, fontSize: 14 }}>
                  {initials(p.firstName, p.lastName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 14.5px var(--font-sans)', color: 'var(--body)' }}>
                    {p.firstName} {p.lastName}
                  </div>
                  <div style={{ font: '400 12.5px var(--font-sans)', color: 'var(--muted)' }}>
                    {p.primaryConditions || 'Home health'}
                  </div>
                </div>
                <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--faint)' }}>
                  {p.mrn}
                </div>
                <Icon
                  name={active ? 'check_circle' : 'radio_button_unchecked'}
                  size={22}
                  style={{ color: active ? 'var(--sage)' : '#ccc2b0' }}
                />
              </button>
            );
          })}
        </div>

        {/* step 2 */}
        <Step n={2} label="Add the visit source" />
        <div className="toggle" style={{ marginBottom: 16 }}>
          <button className={`toggle__btn${mode === 'audio' ? ' active' : ''}`} onClick={() => setMode('audio')}>
            <Icon name="mic" size={19} />
            Upload audio
          </button>
          <button className={`toggle__btn${mode === 'text' ? ' active' : ''}`} onClick={() => setMode('text')}>
            <Icon name="edit_note" size={19} />
            Type text
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          // Some browsers don't tag .opus as audio/*, so list it explicitly.
          accept="audio/*,.opus,.ogg"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {mode === 'audio' ? (
          file ? (
            <div className="file-card fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, flex: 'none', borderRadius: 11, background: 'var(--sage-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="audio_file" size={23} style={{ color: 'var(--sage)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: '600 14px var(--font-sans)', color: 'var(--body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file.name}
                  </div>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 500, color: 'var(--faint)', marginTop: 2 }}>
                    {formatSize(file.size)} · {file.type || 'audio'}
                  </div>
                </div>
                <Waveform bars={10} height={26} />
                <button
                  onClick={() => {
                    setFile(null);
                    if (inputRef.current) inputRef.current.value = '';
                  }}
                  className="btn-ghost"
                  style={{ width: 34, height: 34, padding: 0, justifyContent: 'center', background: 'var(--paper)' }}
                  aria-label="Remove file"
                >
                  <Icon name="delete" size={19} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`dropzone${dragging ? ' drag' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) setFile(f);
              }}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--sage-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Icon name="cloud_upload" size={27} style={{ color: 'var(--sage)' }} />
              </div>
              <div style={{ font: '600 15px var(--font-sans)', color: 'var(--body)' }}>Drop an audio file or browse</div>
              <div style={{ font: '400 12.5px var(--font-sans)', color: '#948a7b', marginTop: 4, marginBottom: 16 }}>
                MP3, WAV, M4A, OPUS · up to 25 MB
              </div>
              <button
                onClick={() => inputRef.current?.click()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 17px', border: '1px solid var(--sage)', background: '#fff', color: 'var(--sage)', borderRadius: 10, font: '600 13.5px var(--font-sans)', cursor: 'pointer' }}
              >
                <Icon name="folder_open" size={18} />
                Browse files
              </button>
            </div>
          )
        ) : (
          <div className="fade-in">
            <textarea
              className="textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your visit notes here — e.g. 'Home visit. Reports increased fatigue and ankle swelling. Weight up 3 lbs, lungs clear…'"
            />
            <div style={{ font: '400 12px var(--font-sans)', color: 'var(--faint)', marginTop: 7 }}>
              ScrAI will structure your free text into a SOAP-format clinical note.
            </div>
          </div>
        )}

        {/* generate */}
        <div className="gen-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, font: '400 12.5px/1.4 var(--font-sans)', color: '#948a7b' }}>
            <Icon name="lock" size={18} style={{ color: '#b7ae9e' }} />
            Processed securely · always reviewed by a clinician
          </div>
          <button
            className="gen-btn"
            disabled={disabled}
            onClick={() => onGenerate({ patientId, mode, file, text, summarize })}
          >
            <Icon name="auto_awesome" size={20} />
            Generate note
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
      <div className="step-num">{n}</div>
      <div style={{ font: '600 15px var(--font-sans)', color: 'var(--body)' }}>{label}</div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

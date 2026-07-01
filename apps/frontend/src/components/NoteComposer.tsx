'use client';

import { useRef, useState } from 'react';
import type { Patient } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { Icon, Waveform } from '@/components/Icon';

export interface GenerateInput {
  patientId: string;
  mode: 'audio' | 'text';
  file: File | null;
  text: string;
  summarize: boolean;
}

const TOGGLE_BTN =
  'inline-flex items-center gap-[7px] px-4 py-2 rounded-[9px] font-sans font-semibold text-[13.5px] cursor-pointer';

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
    <div className="h-full overflow-y-auto">
      <div className="max-w-[760px] mx-auto pt-[30px] px-8 pb-[60px] animate-fade-in">
        <div className="flex items-start justify-between gap-4 mb-[26px]">
          <div>
            <div className="font-serif font-semibold text-[26px] leading-[1.1] text-ink-heading">New clinical note</div>
            <div className="font-sans text-sm text-muted mt-[5px]">
              Capture a home visit — ScrAI transcribes the audio and drafts a structured SOAP note.
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-[38px] h-[38px] flex-none rounded-[10px] border border-line bg-white text-muted flex items-center justify-center cursor-pointer hover:bg-sand"
          >
            <Icon name="close" size={21} />
          </button>
        </div>

        {/* step 1 */}
        <Step n={1} label="Select patient" />
        <div className="grid gap-[10px] mb-7">
          {patients.map((p) => {
            const active = p.id === patientId;
            return (
              <button
                key={p.id}
                onClick={() => setPatientId(p.id)}
                className={`flex items-center gap-[13px] px-[15px] py-[13px] rounded-[13px] border-[1.5px] cursor-pointer text-left w-full ${
                  active ? 'border-sage bg-[#f2f5ef]' : 'border-line bg-white hover:border-[#b8c7b4]'
                }`}
              >
                <Avatar seed={p.id} first={p.firstName} last={p.lastName} size={40} fontSize={14} />
                <div className="flex-1 min-w-0">
                  <div className="font-sans font-semibold text-[14.5px] text-body">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="font-sans text-[12.5px] text-muted">{p.primaryConditions || 'Home health'}</div>
                </div>
                <div className="font-mono font-medium text-[11.5px] text-faint">{p.mrn}</div>
                <Icon
                  name={active ? 'check_circle' : 'radio_button_unchecked'}
                  size={22}
                  style={{ color: active ? '#4f6b52' : '#ccc2b0' }}
                />
              </button>
            );
          })}
        </div>

        {/* step 2 */}
        <Step n={2} label="Add the visit source" />
        <div className="inline-flex p-[3px] bg-[#efeadf] rounded-[11px] gap-[2px] mb-4">
          <button
            className={`${TOGGLE_BTN} ${mode === 'audio' ? 'bg-white text-body shadow-[0_1px_3px_rgba(38,32,25,0.12)]' : 'text-secondary'}`}
            onClick={() => setMode('audio')}
          >
            <Icon name="mic" size={19} />
            Upload audio
          </button>
          <button
            className={`${TOGGLE_BTN} ${mode === 'text' ? 'bg-white text-body shadow-[0_1px_3px_rgba(38,32,25,0.12)]' : 'text-secondary'}`}
            onClick={() => setMode('text')}
          >
            <Icon name="edit_note" size={19} />
            Type text
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          // Some browsers don't tag .opus as audio/*, so list it explicitly.
          accept="audio/*,.opus,.ogg"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {mode === 'audio' ? (
          file ? (
            <div className="bg-white border border-line-card rounded-[14px] px-[18px] py-4 animate-fade-in">
              <div className="flex items-center gap-[14px]">
                <div className="w-11 h-11 flex-none rounded-[11px] bg-sage-tint flex items-center justify-center">
                  <Icon name="audio_file" size={23} style={{ color: '#4f6b52' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans font-semibold text-sm text-body truncate">{file.name}</div>
                  <div className="font-mono font-medium text-[12px] text-faint mt-0.5">
                    {formatSize(file.size)} · {file.type || 'audio'}
                  </div>
                </div>
                <Waveform bars={10} height={26} />
                <button
                  onClick={() => {
                    setFile(null);
                    if (inputRef.current) inputRef.current.value = '';
                  }}
                  aria-label="Remove file"
                  className="w-[34px] h-[34px] flex-none rounded-[9px] border border-line bg-paper text-faint flex items-center justify-center cursor-pointer hover:bg-warn-bg hover:text-[#b0603c] hover:border-warn-border"
                >
                  <Icon name="delete" size={19} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`border-[1.5px] border-dashed rounded-[14px] px-6 py-[30px] text-center ${
                dragging ? 'border-sage bg-[#eff3ec]' : 'border-[#d3cab6] bg-[#fcfaf5]'
              }`}
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
              <div className="w-[52px] h-[52px] rounded-[14px] bg-sage-tint flex items-center justify-center mx-auto mb-3">
                <Icon name="cloud_upload" size={27} style={{ color: '#4f6b52' }} />
              </div>
              <div className="font-sans font-semibold text-[15px] text-body">Drop an audio file or browse</div>
              <div className="font-sans text-[12.5px] text-[#948a7b] mt-1 mb-4">MP3, WAV, M4A, OPUS · up to 25 MB</div>
              <button
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-[7px] px-[17px] py-[9px] border border-sage bg-white text-sage rounded-[10px] font-sans font-semibold text-[13.5px] cursor-pointer hover:bg-[#eff3ec]"
              >
                <Icon name="folder_open" size={18} />
                Browse files
              </button>
            </div>
          )
        ) : (
          <div className="animate-fade-in">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your visit notes here — e.g. 'Home visit. Reports increased fatigue and ankle swelling. Weight up 3 lbs, lungs clear…'"
              className="w-full min-h-[190px] resize-y px-4 py-[15px] border border-line bg-white rounded-[13px] font-sans text-sm leading-[1.6] text-body focus:border-sage"
            />
            <div className="font-sans text-xs text-faint mt-[7px]">
              ScrAI will structure your free text into a SOAP-format clinical note.
            </div>
          </div>
        )}

        {/* generate */}
        <div className="flex items-center justify-between gap-4 mt-7 pt-[22px] border-t border-line-card">
          <div className="flex items-center gap-[9px] font-sans text-[12.5px] leading-[1.4] text-[#948a7b]">
            <Icon name="lock" size={18} style={{ color: '#b7ae9e' }} />
            Processed securely · always reviewed by a clinician
          </div>
          <button
            disabled={disabled}
            onClick={() => onGenerate({ patientId, mode, file, text, summarize })}
            className="inline-flex items-center gap-2 px-[22px] py-3 rounded-[11px] bg-sage text-white font-sans font-semibold text-[15px] cursor-pointer shadow-[0_4px_12px_-2px_rgba(76,107,82,0.4)] flex-none hover:bg-sage-deep disabled:bg-[#cdd5c7] disabled:text-[#f4f1ea] disabled:cursor-not-allowed disabled:shadow-none"
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
    <div className="flex items-center gap-[10px] mb-[13px]">
      <div className="w-6 h-6 flex-none rounded-full bg-sage text-white flex items-center justify-center font-sans font-semibold text-xs">
        {n}
      </div>
      <div className="font-sans font-semibold text-[15px] text-body">{label}</div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

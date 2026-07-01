'use client';

import { useState } from 'react';
import type { NoteDetailDto, Patient } from '@/lib/api';
import { Icon } from '@/components/Icon';
import { StatusPill } from '@/components/NoteChips';
import { PatientSidebar } from '@/components/PatientSidebar';
import { formatFullDate, parseSoap, SOAP_TINTS } from '@/lib/design';
import { BTN_GHOST } from '@/lib/ui';

const TAB = 'inline-flex items-center gap-1.5 px-[14px] py-1.5 rounded-lg font-sans font-semibold text-[13px] cursor-pointer';

export function NoteDetailView({ note, patient }: { note: NoteDetailDto; patient: Patient | null }) {
  const [tab, setTab] = useState<'soap' | 'transcript'>(note.processedText ? 'soap' : 'transcript');
  const soap = parseSoap(note.processedText);
  const sourceLine = note.source === 'audio' ? `Audio${note.audioFilename ? ` · ${note.audioFilename}` : ''}` : 'Typed note';

  const copy = () => {
    const text = note.processedText || note.rawText || '';
    if (text && navigator.clipboard) navigator.clipboard.writeText(text).catch(() => undefined);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* topbar */}
        <div className="flex-none pt-[18px] px-[26px] pb-4 border-b border-line bg-paper flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-[9px] mb-[5px]">
              <StatusPill status={note.status} />
              <span className="font-mono font-medium text-[11.5px] text-faint">{formatFullDate(note.createdAt)}</span>
            </div>
            <div className="font-serif font-semibold text-[22px] leading-[1.2] text-ink-heading">
              {note.title || 'Clinical note'}
            </div>
            <div className="font-sans text-[13px] text-muted mt-[3px]">
              {patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown patient'} · {sourceLine}
            </div>
          </div>
          <div className="flex gap-[9px] flex-none">
            <button className={BTN_GHOST} onClick={copy}>
              <Icon name="content_copy" size={18} />
              Copy
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="flex-none px-[26px] py-3 border-b border-line-soft bg-paper flex items-center justify-between gap-3">
          <div className="inline-flex p-[3px] bg-[#efeadf] rounded-[10px] gap-[2px]">
            <button
              className={`${TAB} ${tab === 'soap' ? 'bg-white text-body shadow-[0_1px_3px_rgba(38,32,25,0.12)]' : 'text-secondary'}`}
              onClick={() => setTab('soap')}
            >
              <Icon name="summarize" size={17} />
              SOAP note
            </button>
            <button
              className={`${TAB} ${tab === 'transcript' ? 'bg-white text-body shadow-[0_1px_3px_rgba(38,32,25,0.12)]' : 'text-secondary'}`}
              onClick={() => setTab('transcript')}
            >
              <Icon name="forum" size={17} />
              {note.source === 'audio' ? 'Transcript' : 'Note text'}
            </button>
          </div>
          <span className="inline-flex items-center gap-1.5 px-[11px] py-[5px] rounded-[20px] bg-clay-tint text-clay-deep font-sans font-semibold text-[11.5px]">
            <Icon name="auto_awesome" size={16} />
            AI-generated
          </span>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto pt-6 px-[26px] pb-10">
          {tab === 'soap' ? (
            <div className="max-w-[720px] animate-fade-in">
              {note.status === 'failed' && note.error ? (
                <div className="flex gap-[11px] items-start px-4 py-[13px] bg-warn-bg border border-warn-border rounded-xl mb-5 font-sans text-[13px] leading-[1.55] text-[#6e6456]">
                  <Icon name="error" style={{ color: '#b0603c', marginTop: 1 }} />
                  <div>
                    <strong className="text-[#9a4f2e]">AI processing failed.</strong> The raw note was preserved.{' '}
                    <span className="text-clay-deep font-medium">{note.error}</span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-[11px] items-start px-4 py-[13px] bg-[#f2eee6] border border-line-card rounded-xl mb-5 font-sans text-[13px] leading-[1.55] text-[#6e6456]">
                  <Icon name="auto_awesome" style={{ color: '#4f6b52', marginTop: 1 }} />
                  <div>
                    Structured from the visit by ScrAI. Model output —{' '}
                    <span className="text-sage font-semibold">requires clinician review</span> before it enters the chart.
                  </div>
                </div>
              )}

              {soap.length > 0 ? (
                soap.map((sec) => {
                  const tint = SOAP_TINTS[sec.key] ?? SOAP_TINTS.S;
                  return (
                    <div
                      key={sec.key}
                      className="bg-white border border-line-card rounded-[15px] px-5 py-[18px] mb-[14px] shadow-[0_1px_2px_rgba(38,32,25,0.03)]"
                    >
                      <div className="flex items-center gap-3 mb-[13px]">
                        <div
                          className="w-[34px] h-[34px] flex-none rounded-[10px] flex items-center justify-center font-serif font-semibold text-[16px]"
                          style={{ background: tint.bg, color: tint.fg }}
                        >
                          {sec.key}
                        </div>
                        <div>
                          <div className="font-sans font-semibold text-[15.5px] text-body leading-[1.1]">{sec.label}</div>
                          <div className="font-mono font-medium text-[10.5px] text-faint uppercase tracking-[0.05em]">
                            {sec.sub}
                          </div>
                        </div>
                      </div>
                      {sec.lines.map((line, i) => (
                        <div className="flex gap-[11px] py-[5px]" key={i}>
                          <span
                            className="w-[5px] h-[5px] flex-none rounded-full mt-[9px] opacity-[0.65]"
                            style={{ background: tint.fg }}
                          />
                          <div className="font-sans text-sm leading-[1.55] text-body-soft">{line}</div>
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                <div className="bg-white border border-line-card rounded-[15px] px-5 py-[18px]">
                  <div className="font-sans text-sm leading-[1.55] text-body-soft whitespace-pre-wrap">
                    {note.processedText || note.rawText || 'No summary was generated for this note.'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-[720px] animate-fade-in">
              <div className="flex items-center gap-[9px] mb-[18px] font-mono text-[12px] text-faint uppercase tracking-[0.03em]">
                <Icon name="graphic_eq" size={17} />
                {note.source === 'audio' ? 'Raw transcript · Whisper' : 'Typed note'}
              </div>
              {note.audioUrl ? (
                <div className="mb-[18px]">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <audio controls src={note.audioUrl} className="w-full" />
                </div>
              ) : null}
              <div className="font-sans text-[14.5px] leading-[1.7] text-body-soft whitespace-pre-wrap pl-[15px] border-l-2 border-line-card">
                {note.rawText || '(no content)'}
              </div>
            </div>
          )}
        </div>
      </div>

      <PatientSidebar patient={patient} />
    </div>
  );
}

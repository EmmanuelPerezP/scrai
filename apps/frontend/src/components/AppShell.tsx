'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NotesService,
  PatientsService,
  type NoteDetailDto,
  type NoteListItemDto,
  type Patient,
} from '@/lib/api';
import { Icon, Waveform } from '@/components/Icon';
import { NoteComposer, type GenerateInput } from '@/components/NoteComposer';
import { NoteDetailView } from '@/components/NoteDetailView';
import { avatarTint, formatShortTime, initials } from '@/lib/design';

type View = 'note' | 'newNote' | 'processing';

const STATUS_CHIP: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Complete', color: '#4f6b52', bg: '#e7eee4' },
  failed: { label: 'Failed', color: '#a85636', bg: '#f3e2d8' },
  processing: { label: 'Processing', color: '#7a6326', bg: '#efe6ce' },
  pending: { label: 'Pending', color: '#7a6326', bg: '#efe6ce' },
};

const AUDIO_STEPS = [
  { label: 'Uploading recording', sub: 'Encrypted transfer' },
  { label: 'Transcribing audio', sub: 'Whisper' },
  { label: 'Structuring clinical note', sub: 'GPT-4o-mini · SOAP' },
];
const TEXT_STEPS = [
  { label: 'Analyzing note text', sub: 'Parsing content' },
  { label: 'Structuring clinical note', sub: 'GPT-4o-mini · SOAP' },
];

export function AppShell() {
  const [notes, setNotes] = useState<NoteListItemDto[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<View>('note');
  const [detail, setDetail] = useState<NoteDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [pipeMode, setPipeMode] = useState<'audio' | 'text'>('audio');
  const [pipeStep, setPipeStep] = useState(0);
  const pipeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const detailCache = useRef<Map<string, NoteDetailDto>>(new Map());

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [n, p] = await Promise.all([NotesService.listNotes(), PatientsService.listPatients()]);
        if (cancelled) return;
        setNotes(n);
        setPatients(p);
        if (n.length > 0) setActiveId(n[0].id);
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch detail when the active note changes (while viewing a note)
  useEffect(() => {
    if (view !== 'note' || !activeId) return;
    const cached = detailCache.current.get(activeId);
    if (cached) {
      setDetail(cached);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    NotesService.getNote({ id: activeId })
      .then((d) => {
        if (cancelled) return;
        detailCache.current.set(d.id, d);
        setDetail(d);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, view]);

  const openNote = useCallback((id: string) => {
    setActiveId(id);
    setView('note');
  }, []);

  const startPipe = (mode: 'audio' | 'text') => {
    setPipeMode(mode);
    setPipeStep(0);
    const steps = mode === 'audio' ? AUDIO_STEPS : TEXT_STEPS;
    if (pipeTimer.current) clearInterval(pipeTimer.current);
    pipeTimer.current = setInterval(() => {
      setPipeStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 1400);
  };
  const stopPipe = () => {
    if (pipeTimer.current) clearInterval(pipeTimer.current);
    pipeTimer.current = null;
  };
  useEffect(() => () => stopPipe(), []);

  const generate = async (input: GenerateInput) => {
    const patient = patients.find((p) => p.id === input.patientId);
    const title = patient ? `Home visit · ${patient.lastName}` : undefined;
    setView('processing');
    startPipe(input.mode);
    try {
      const created =
        input.mode === 'text'
          ? await NotesService.createTextNote({
              requestBody: { patientId: input.patientId, title, text: input.text, summarize: input.summarize },
            })
          : await NotesService.createAudioNote({
              formData: {
                patientId: input.patientId,
                title,
                summarize: input.summarize,
                file: input.file as Blob,
              },
            });
      detailCache.current.set(created.id, created);
      setDetail(created);
      // Refresh the list so the new card (with preview + patient) appears.
      const fresh = await NotesService.listNotes().catch(() => notes);
      setNotes(fresh);
      setActiveId(created.id);
      setView('note');
    } catch (err) {
      alert(`Could not generate note: ${err instanceof Error ? err.message : 'unknown error'}`);
      setView('newNote');
    } finally {
      stopPipe();
    }
  };

  const filtered = notes.filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = n.patient ? `${n.patient.firstName} ${n.patient.lastName}`.toLowerCase() : '';
    return name.includes(q) || (n.title ?? '').toLowerCase().includes(q) || n.preview.toLowerCase().includes(q);
  });

  const activePatient = detail ? patients.find((p) => p.id === detail.patientId) ?? null : null;

  return (
    <div className="app">
      {/* rail */}
      <nav className="rail">
        <div className="rail__logo" title="ScrAI">
          <Icon name="graphic_eq" size={23} />
        </div>
        <button className="rail__btn active" title="Notes">
          <Icon name="clinical_notes" size={22} />
        </button>
        <button className="rail__btn" title="Patients">
          <Icon name="groups" size={22} />
        </button>
        <button className="rail__btn" title="Schedule">
          <Icon name="calendar_month" size={22} />
        </button>
        <button className="rail__btn" title="Templates">
          <Icon name="article" size={22} />
        </button>
        <div style={{ flex: 1 }} />
        <button className="rail__btn" title="Help">
          <Icon name="help" size={22} />
        </button>
        <div className="rail__avatar" title="Riley Nolan, RN">
          RN
        </div>
      </nav>

      {/* notes list column */}
      <div className="col">
        <div className="col__head">
          <div className="col__titlerow">
            <div className="col__title">Notes</div>
            <div className="col__count">{notes.length} total</div>
          </div>
          <div className="col__sub">Home Health · Field Documentation</div>
          <button className="btn-sage" style={{ width: '100%' }} onClick={() => setView('newNote')}>
            <Icon name="add" size={20} />
            New clinical note
          </button>
          <div className="search">
            <Icon name="search" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes or patients" />
          </div>
        </div>
        <div className="list">
          {loading ? (
            <div style={{ padding: 24, color: 'var(--muted)', font: '400 13px var(--font-sans)' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--muted)', font: '400 13px var(--font-sans)' }}>
              {notes.length === 0 ? 'No notes yet.' : 'No matches.'}
            </div>
          ) : (
            filtered.map((n) => <NoteCard key={n.id} note={n} active={n.id === activeId && view === 'note'} onOpen={() => openNote(n.id)} />)
          )}
        </div>
      </div>

      {/* main panel */}
      <div className="main">
        {view === 'newNote' ? (
          <NoteComposer patients={patients} onClose={() => setView('note')} onGenerate={generate} />
        ) : view === 'processing' ? (
          <Processing mode={pipeMode} step={pipeStep} />
        ) : loadError ? (
          <EmptyState message={loadError} onNew={() => setView('newNote')} title="Couldn’t reach the API" />
        ) : detailLoading && !detail ? (
          <div className="center-panel">
            <Waveform />
          </div>
        ) : detail && activeId ? (
          <NoteDetailView key={detail.id} note={detail} patient={activePatient} />
        ) : (
          <EmptyState onNew={() => setView('newNote')} />
        )}
      </div>
    </div>
  );
}

function NoteCard({ note, active, onOpen }: { note: NoteListItemDto; active: boolean; onOpen: () => void }) {
  const p = note.patient;
  const tint = avatarTint(note.patientId);
  const chip = STATUS_CHIP[note.status] ?? STATUS_CHIP.pending;
  return (
    <button className={`note-card${active ? ' active' : ''}`} onClick={onOpen}>
      <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
        <div className="avatar" style={{ width: 34, height: 34, background: tint.bg, color: tint.fg, fontSize: 12.5 }}>
          {p ? initials(p.firstName, p.lastName) : '·'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ font: '600 13.5px var(--font-sans)', color: 'var(--body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p ? `${p.firstName} ${p.lastName}` : 'Unknown patient'}
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--faint)', whiteSpace: 'nowrap', flex: 'none' }}>
              {formatShortTime(note.createdAt)}
            </div>
          </div>
          <div style={{ font: '500 12px var(--font-sans)', color: '#7a7062', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {note.title || 'Clinical note'}
          </div>
        </div>
      </div>
      <div className="note-card__preview">{note.preview || '(no content)'}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="chip" style={{ padding: '3px 8px 3px 7px', background: chip.bg, color: chip.color }}>
          <span className="dot" style={{ background: chip.color }} />
          {chip.label}
        </span>
        <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--faint)', fontSize: 11, fontWeight: 500 }}>
          <Icon name={note.source === 'audio' ? 'graphic_eq' : 'edit_note'} size={15} />
          {note.source === 'audio' ? 'Audio' : 'Text'}
        </span>
      </div>
    </button>
  );
}

function Processing({ mode, step }: { mode: 'audio' | 'text'; step: number }) {
  const steps = mode === 'audio' ? AUDIO_STEPS : TEXT_STEPS;
  return (
    <div className="center-panel">
      <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }} className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56, marginBottom: 24 }}>
          <Waveform bars={16} height={40} />
        </div>
        <div style={{ font: '600 20px var(--font-serif)', color: 'var(--ink-heading)' }}>Processing note…</div>
        <div style={{ font: '400 13.5px var(--font-sans)', color: 'var(--muted)', marginTop: 5, marginBottom: 26 }}>
          ScrAI is transcribing and structuring the visit.
        </div>
        <div className="pipe">
          {steps.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'active' : 'pending';
            const iconCol = state === 'done' ? 'var(--sage)' : state === 'active' ? 'var(--clay)' : '#c3b9a8';
            const icon = state === 'done' ? 'check_circle' : state === 'active' ? 'progress_activity' : 'radio_button_unchecked';
            return (
              <div className="pipe-step" key={i}>
                <Icon name={icon} size={22} style={{ color: iconCol }} {...(state === 'active' ? { } : {})} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ font: '600 14px var(--font-sans)', color: state === 'pending' ? 'var(--faint)' : 'var(--body)' }}>{s.label}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--faint)' }}>{s.sub}</div>
                </div>
                <span style={{ font: '500 11.5px var(--font-sans)', color: state === 'done' ? 'var(--sage)' : 'var(--faint)' }}>
                  {state === 'done' ? 'Done' : state === 'active' ? 'Working…' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onNew, title = 'No note selected', message }: { onNew: () => void; title?: string; message?: string }) {
  return (
    <div className="empty">
      <div style={{ width: 64, height: 64, borderRadius: 18, background: '#efeadf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="description" size={32} style={{ color: '#b7ae9e' }} />
      </div>
      <div style={{ font: '600 19px var(--font-serif)', color: 'var(--ink-heading)' }}>{title}</div>
      <div style={{ font: '400 13.5px var(--font-sans)', color: 'var(--muted)', maxWidth: 280 }}>
        {message ?? 'Pick a note from the list or capture a new visit to get started.'}
      </div>
      <button className="btn-sage" style={{ marginTop: 4 }} onClick={onNew}>
        <Icon name="add" size={20} />
        New clinical note
      </button>
    </div>
  );
}

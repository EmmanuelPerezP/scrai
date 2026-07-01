'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { NotesService, PatientsService, type NoteListItemDto, type Patient } from '@/lib/api';
import type { GenerateInput } from '@/components/NoteComposer';
import { useNoteDetail } from '@/hooks/useNoteDetail';
import { useProcessingPipeline } from '@/hooks/useProcessingPipeline';

export type View = 'note' | 'newNote' | 'processing';

/**
 * Top-level state for the notes app. Data loading, detail fetching, and the
 * processing animation each live in their own hook; this one owns navigation
 * (view / active note / search) and the generate action that ties them together.
 */
export function useNotesApp() {
  const [notes, setNotes] = useState<NoteListItemDto[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<View>('note');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const pipeline = useProcessingPipeline();
  const { detail, detailLoading, putDetail } = useNoteDetail(activeId, view === 'note');

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

  const openNote = useCallback((id: string) => {
    setActiveId(id);
    setView('note');
  }, []);
  const startNewNote = useCallback(() => setView('newNote'), []);
  const closeComposer = useCallback(() => setView('note'), []);

  const generate = useCallback(
    async (input: GenerateInput) => {
      const patient = patients.find((p) => p.id === input.patientId);
      const title = patient ? `Home visit · ${patient.lastName}` : undefined;
      setView('processing');
      pipeline.start(input.mode);
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
        putDetail(created);
        const fresh = await NotesService.listNotes().catch(() => notes);
        setNotes(fresh);
        setActiveId(created.id);
        setView('note');
      } catch (err) {
        alert(`Could not generate note: ${err instanceof Error ? err.message : 'unknown error'}`);
        setView('newNote');
      } finally {
        pipeline.stop();
      }
    },
    [patients, notes, pipeline, putDetail],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => {
      const name = n.patient ? `${n.patient.firstName} ${n.patient.lastName}`.toLowerCase() : '';
      return name.includes(q) || (n.title ?? '').toLowerCase().includes(q) || n.preview.toLowerCase().includes(q);
    });
  }, [notes, search]);

  const activePatient = useMemo(
    () => (detail ? patients.find((p) => p.id === detail.patientId) ?? null : null),
    [detail, patients],
  );

  return {
    notes,
    patients,
    loading,
    loadError,
    view,
    activeId,
    detail,
    detailLoading,
    activePatient,
    search,
    setSearch,
    filtered,
    pipeMode: pipeline.mode,
    pipeStep: pipeline.step,
    openNote,
    startNewNote,
    closeComposer,
    generate,
  };
}

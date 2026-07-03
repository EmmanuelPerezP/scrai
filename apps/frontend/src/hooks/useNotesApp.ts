'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListNotesQueryKey,
  useCreateAudioNote,
  useCreateAudioUploadUrl,
  useCreateTextNote,
  useListNotes,
  useListPatients,
  type NoteListItemDto,
  type Patient,
} from '@/lib/api';
import type { GenerateInput } from '@/components/NoteComposer';
import { useNoteDetail } from '@/hooks/useNoteDetail';
import { useProcessingPipeline } from '@/hooks/useProcessingPipeline';

export type View = 'note' | 'newNote' | 'processing';

// Stable empty refs so downstream memos don't recompute every render.
const EMPTY_NOTES: NoteListItemDto[] = [];
const EMPTY_PATIENTS: Patient[] = [];

/**
 * Top-level state for the notes app. Data fetching + caching is delegated to
 * the generated React Query hooks; this owns navigation (view / active note /
 * search) and the generate action that ties queries and mutations together.
 */
export function useNotesApp() {
  const queryClient = useQueryClient();
  const notesQuery = useListNotes();
  const patientsQuery = useListPatients();
  const createText = useCreateTextNote();
  const createAudio = useCreateAudioNote();
  const createUploadUrl = useCreateAudioUploadUrl();
  const pipeline = useProcessingPipeline();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<View>('note');
  const [search, setSearch] = useState('');

  const notes = notesQuery.data ?? EMPTY_NOTES;
  const patients = patientsQuery.data ?? EMPTY_PATIENTS;
  const loading = notesQuery.isLoading || patientsQuery.isLoading;
  const loadErr = (notesQuery.error ?? patientsQuery.error) as Error | null;
  const loadError = loadErr ? loadErr.message : null;

  const { detail, detailLoading, putDetail } = useNoteDetail(activeId, view === 'note');

  // Select the newest note once the list arrives.
  useEffect(() => {
    if (activeId == null && notes.length > 0) setActiveId(notes[0].id);
  }, [notes, activeId]);

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
        let created;
        if (input.mode === 'text') {
          created = await createText.mutateAsync({
            data: { patientId: input.patientId, title, text: input.text, summarize: input.summarize },
          });
        } else {
          // Audio: upload straight to S3 via a presigned PUT, then create the
          // note referencing the object key — the bytes never touch the API.
          const file = input.file as File;
          const contentType = file.type || 'application/octet-stream';
          const { key, url } = await createUploadUrl.mutateAsync({
            data: { filename: file.name, contentType },
          });
          const put = await fetch(url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': contentType },
          });
          if (!put.ok) {
            throw new Error(`Audio upload failed (${put.status})`);
          }
          created = await createAudio.mutateAsync({
            data: {
              patientId: input.patientId,
              title,
              summarize: input.summarize,
              audioKey: key,
              audioFilename: file.name,
            },
          });
        }
        putDetail(created);
        await queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        setActiveId(created.id);
        setView('note');
      } catch (err) {
        alert(`Could not generate note: ${err instanceof Error ? err.message : 'unknown error'}`);
        setView('newNote');
      } finally {
        pipeline.stop();
      }
    },
    [patients, createText, createAudio, createUploadUrl, pipeline, putDetail, queryClient],
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

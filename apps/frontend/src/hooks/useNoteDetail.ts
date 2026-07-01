'use client';

import { useQueryClient } from '@tanstack/react-query';
import { getGetNoteQueryKey, useGetNote, type NoteDetailDto } from '@/lib/api';

/**
 * Full note detail for the active note, via the generated React Query hook.
 * `putDetail` seeds the cache so a just-created note shows without a round-trip.
 */
export function useNoteDetail(activeId: string | null, enabled: boolean) {
  const query = useGetNote(activeId ?? '', {
    query: { enabled: enabled && !!activeId },
  });
  const queryClient = useQueryClient();

  const putDetail = (note: NoteDetailDto) => {
    queryClient.setQueryData(getGetNoteQueryKey(note.id), note);
  };

  return {
    detail: query.data ?? null,
    detailLoading: query.isLoading,
    putDetail,
  };
}

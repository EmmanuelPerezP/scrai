'use client';

import { useEffect, useRef, useState } from 'react';
import { NotesService, type NoteDetailDto } from '@/lib/api';

/**
 * Loads and caches the full note detail for the active note. `putDetail` lets
 * a just-created note seed the cache without a round-trip.
 */
export function useNoteDetail(activeId: string | null, enabled: boolean) {
  const [detail, setDetail] = useState<NoteDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const cache = useRef<Map<string, NoteDetailDto>>(new Map());

  useEffect(() => {
    if (!enabled || !activeId) return;
    const cached = cache.current.get(activeId);
    if (cached) {
      setDetail(cached);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    NotesService.getNote({ id: activeId })
      .then((d) => {
        if (cancelled) return;
        cache.current.set(d.id, d);
        setDetail(d);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, enabled]);

  const putDetail = (d: NoteDetailDto) => {
    cache.current.set(d.id, d);
    setDetail(d);
  };

  return { detail, detailLoading, putDetail };
}

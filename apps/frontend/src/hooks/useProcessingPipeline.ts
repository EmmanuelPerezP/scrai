'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PipelineStep {
  label: string;
  sub: string;
}

export const AUDIO_STEPS: PipelineStep[] = [
  { label: 'Uploading recording', sub: 'Encrypted transfer' },
  { label: 'Transcribing audio', sub: 'Whisper' },
  { label: 'Structuring clinical note', sub: 'GPT-4o-mini · SOAP' },
];
export const TEXT_STEPS: PipelineStep[] = [
  { label: 'Analyzing note text', sub: 'Parsing content' },
  { label: 'Structuring clinical note', sub: 'GPT-4o-mini · SOAP' },
];

/**
 * Drives the visual "processing" checklist while a note is created. The steps
 * advance on a timer (the backend call is synchronous), and `stop()` freezes it
 * when the request resolves.
 */
export function useProcessingPipeline() {
  const [mode, setMode] = useState<'audio' | 'text'>('audio');
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(
    (nextMode: 'audio' | 'text') => {
      setMode(nextMode);
      setStep(0);
      const steps = nextMode === 'audio' ? AUDIO_STEPS : TEXT_STEPS;
      stop();
      timer.current = setInterval(() => {
        setStep((s) => (s < steps.length - 1 ? s + 1 : s));
      }, 1400);
    },
    [stop],
  );

  return { mode, step, start, stop };
}

import { Icon, Waveform } from '@/components/Icon';
import { AUDIO_STEPS, TEXT_STEPS } from '@/hooks/useProcessingPipeline';

/** Animated pipeline while a note is transcribed + structured. */
export function Processing({ mode, step }: { mode: 'audio' | 'text'; step: number }) {
  const steps = mode === 'audio' ? AUDIO_STEPS : TEXT_STEPS;
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="w-full max-w-[440px] text-center animate-fade-in">
        <div className="flex items-center justify-center h-14 mb-6">
          <Waveform bars={16} height={40} />
        </div>
        <div className="font-serif font-semibold text-[20px] text-ink-heading">Processing note…</div>
        <div className="font-sans text-[13.5px] text-muted mt-[5px] mb-[26px]">
          ScrAI is transcribing and structuring the visit.
        </div>
        <div className="bg-white border border-line-card rounded-[15px] px-1.5 py-2 text-left">
          {steps.map((s, i) => {
            const state = i < step ? 'done' : i === step ? 'active' : 'pending';
            const iconCol = state === 'done' ? '#4f6b52' : state === 'active' ? '#bc6a47' : '#c3b9a8';
            const icon =
              state === 'done' ? 'check_circle' : state === 'active' ? 'progress_activity' : 'radio_button_unchecked';
            return (
              <div className="flex items-center gap-3 px-[14px] py-3" key={s.label}>
                <Icon name={icon} size={22} style={{ color: iconCol }} className={state === 'active' ? 'animate-spin' : undefined} />
                <div className="flex-1 text-left">
                  <div className={`font-sans font-semibold text-sm ${state === 'pending' ? 'text-faint' : 'text-body'}`}>
                    {s.label}
                  </div>
                  <div className="font-mono text-[11px] text-faint">{s.sub}</div>
                </div>
                <span className={`font-sans font-medium text-[11.5px] ${state === 'done' ? 'text-sage' : 'text-faint'}`}>
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

import { act, renderHook } from '@testing-library/react';
import { AUDIO_STEPS, useProcessingPipeline } from './useProcessingPipeline';

describe('useProcessingPipeline', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('starts at step 0 and records the mode', () => {
    const { result } = renderHook(() => useProcessingPipeline());
    act(() => result.current.start('text'));
    expect(result.current.mode).toBe('text');
    expect(result.current.step).toBe(0);
  });

  it('advances on the timer and caps at the last step', () => {
    const { result } = renderHook(() => useProcessingPipeline());
    act(() => result.current.start('audio'));

    act(() => {
      jest.advanceTimersByTime(1400);
    });
    expect(result.current.step).toBe(1);

    // Run well past the number of steps — it should stop at the final one.
    act(() => {
      jest.advanceTimersByTime(1400 * 10);
    });
    expect(result.current.step).toBe(AUDIO_STEPS.length - 1);
  });

  it('stop() freezes progress', () => {
    const { result } = renderHook(() => useProcessingPipeline());
    act(() => result.current.start('audio'));
    act(() => {
      jest.advanceTimersByTime(1400);
    });
    act(() => result.current.stop());

    const frozen = result.current.step;
    act(() => {
      jest.advanceTimersByTime(1400 * 5);
    });
    expect(result.current.step).toBe(frozen);
  });
});

# Sample audio

Realistic home-health visit dictations for testing the **audio → Whisper →
SOAP** flow. Upload any of them in the app under **New clinical note → Upload
audio**.

| File | Patient (seed) | Scenario |
| --- | --- | --- |
| `eleanor-whitfield-chf.m4a` | Eleanor Whitfield (MRN-001) | CHF with fluid overload |
| `marcus-delgado-copd.m4a` | Marcus Delgado (MRN-002) | COPD exacerbation + diabetes |
| `aiko-tanaka-post-op-knee.m4a` | Aiko Tanaka (MRN-003) | Post-op knee recovery |
| `routine-stable-visit.m4a` | any | Short, stable routine visit |

## Regenerate

When `ffmpeg` is available the script also writes an Ogg-Opus (`.opus`) variant
of each file — the app accepts `.opus` too (it's relabelled `.ogg` for Whisper,
which decodes the same container).

The `.m4a` files under `audio/` are produced by
[`scripts/generate-sample-audio.sh`](../scripts/generate-sample-audio.sh) using
macOS `say` + `afconvert` (both built in). Re-run any time:

```bash
./scripts/generate-sample-audio.sh
# optional: pick a voice — SAY_VOICE=Daniel ./scripts/generate-sample-audio.sh
```

> Transcription + SOAP require a valid `OPENAI_API_KEY` with the `openai`
> provider (`AI_PROVIDER=openai`). With the default `stub` provider the flow
> still works end-to-end but returns canned text.

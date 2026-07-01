#!/usr/bin/env bash
#
# Generate realistic home-health visit dictations as audio files you can upload
# to test the audio → Whisper → SOAP flow. Uses macOS `say` + `afconvert`
# (both built in), so this is macOS-only. Output: samples/audio/*.m4a
#
# Usage:  ./scripts/generate-sample-audio.sh   [SAY_VOICE=Samantha]
#
set -euo pipefail

OUT="$(cd "$(dirname "$0")/.." && pwd)/samples/audio"
VOICE="${SAY_VOICE:-Samantha}"
mkdir -p "$OUT"

if ! command -v say >/dev/null || ! command -v afconvert >/dev/null; then
  echo "This script needs macOS 'say' and 'afconvert'." >&2
  exit 1
fi

gen() {
  local name="$1"
  local text="$2"
  say -v "$VOICE" -r 175 -o "/tmp/scrai-$name.aiff" "$text"
  afconvert "/tmp/scrai-$name.aiff" "$OUT/$name.m4a" -f m4af -d aac
  rm -f "/tmp/scrai-$name.aiff"
  printf '  %-34s %s\n' "$name.m4a" "$(du -h "$OUT/$name.m4a" | cut -f1)"
}

echo "Generating sample clinical audio (voice: $VOICE) →  $OUT"

gen "eleanor-whitfield-chf" \
"Home visit for Eleanor Whitfield. Patient reports increased shortness of breath \
over the past three days and swelling in both ankles. Weight is up four pounds \
since last week. Blood pressure is one forty-two over eighty-eight. Lungs have \
mild crackles at the bases. Assessment: congestive heart failure with mild fluid \
overload. Plan: increase furosemide to forty milligrams daily, daily weights, \
follow up in one week, and call if breathing worsens."

gen "marcus-delgado-copd" \
"Home visit for Marcus Delgado. Patient reports a productive cough and increased \
use of his rescue inhaler over the last week. Blood sugar readings range from one \
forty to one ninety. No fever. Lungs have scattered wheezes. Assessment: COPD \
exacerbation with suboptimal glucose control. Plan: start a five day prednisone \
taper, continue metformin, reinforce inhaler technique, and follow up in five days."

gen "aiko-tanaka-post-op-knee" \
"Home visit for Aiko Tanaka, two weeks after right total knee replacement. Reports \
pain is well controlled with acetaminophen. The incision is clean and dry with no \
signs of infection. Range of motion is improving, zero to ninety degrees. \
Assessment: normal post-operative recovery. Plan: continue physical therapy three \
times weekly, wean off narcotics, and follow up in two weeks."

gen "routine-stable-visit" \
"Routine home health visit. Patient is stable with no new complaints. Vital signs \
are within normal limits. Continue current medications and plan of care. Follow up \
as scheduled."

# Also emit Ogg-Opus variants (the app supports .opus) when ffmpeg is available.
if command -v ffmpeg >/dev/null; then
  echo "Emitting .opus variants (ffmpeg found):"
  for f in "$OUT"/*.m4a; do
    base="${f%.m4a}"
    ffmpeg -y -i "$f" -c:a libopus -b:a 24k "$base.opus" >/dev/null 2>&1
    printf '  %-34s %s\n' "$(basename "$base").opus" "$(du -h "$base.opus" | cut -f1)"
  done
fi

echo "Done. Upload any of these in the app's 'New clinical note → Upload audio' flow."

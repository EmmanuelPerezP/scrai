/**
 * Design tokens + view helpers for the ScrAI "warm clinical" design system
 * (sand / sage / clay). Mirrors the design handoff: Newsreader (serif),
 * Hanken Grotesk (UI), Spline Sans Mono (IDs/timestamps).
 */

export const AVATAR_TINTS = [
  { bg: '#E4EDE2', fg: '#3C5440' }, // sage
  { bg: '#F2E1D6', fg: '#9C5334' }, // clay
  { bg: '#EFE6CE', fg: '#7A6326' }, // ochre
] as const;

export const SOAP_TINTS: Record<string, { bg: string; fg: string }> = {
  S: { bg: '#E7EEE4', fg: '#4F6B52' },
  O: { bg: '#EFE6CE', fg: '#7A6326' },
  A: { bg: '#F3E2D8', fg: '#A85636' },
  P: { bg: '#E4EDE7', fg: '#3F6B57' },
};

const SOAP_LABELS: Record<string, { label: string; sub: string }> = {
  S: { label: 'Subjective', sub: 'Patient-reported' },
  O: { label: 'Objective', sub: 'Observed / measured' },
  A: { label: 'Assessment', sub: 'Clinical impression' },
  P: { label: 'Plan', sub: 'Next steps' },
};

export function initials(first?: string, last?: string): string {
  return `${(first ?? '').charAt(0)}${(last ?? '').charAt(0)}`.toUpperCase() || '·';
}

export function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Single source of truth for note-status presentation (chip + pill). */
export const NOTE_STATUS_META: Record<string, { label: string; fg: string; bg: string; icon: string }> = {
  completed: { label: 'Complete', fg: '#4f6b52', bg: '#e7eee4', icon: 'verified' },
  failed: { label: 'Failed', fg: '#a85636', bg: '#f3e2d8', icon: 'error' },
  processing: { label: 'Processing', fg: '#7a6326', bg: '#efe6ce', icon: 'progress_activity' },
  pending: { label: 'Pending', fg: '#7a6326', bg: '#efe6ce', icon: 'schedule' },
};
export const noteStatusMeta = (status: string) => NOTE_STATUS_META[status] ?? NOTE_STATUS_META.pending;

export const NOTE_SOURCE_META: Record<string, { label: string; icon: string }> = {
  audio: { label: 'Audio', icon: 'graphic_eq' },
  text: { label: 'Text', icon: 'edit_note' },
};
export const noteSourceMeta = (source: string) => NOTE_SOURCE_META[source] ?? NOTE_SOURCE_META.text;

/** Deterministic avatar tint from a stable seed (e.g. patient id). */
export function avatarTint(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

export function computeAge(dob: string): number | null {
  const [y, m, d] = dob.split('-').map(Number);
  if (!y || !m || !d) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - y;
  const md = now.getUTCMonth() + 1 - m || now.getUTCDate() - d;
  if (md < 0) age -= 1;
  return age;
}

export function formatDob(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatFullDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Short relative-ish timestamp for list rows: "Today 14:32" / "Jun 30". */
export function formatShortTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export interface SoapSection {
  key: string; // S | O | A | P
  label: string;
  sub: string;
  lines: string[];
}

/**
 * Parse the backend's free-text SOAP output (e.g. "S (Subjective): ...") into
 * structured sections for the letter-badge cards. Falls back gracefully if the
 * text doesn't follow the S/O/A/P shape.
 */
export function parseSoap(text: string | null | undefined): SoapSection[] {
  if (!text) return [];
  const lines = text.split('\n');
  const sections: SoapSection[] = [];
  let current: SoapSection | null = null;

  const header = /^\s*([SOAP])\s*\(([^)]+)\)\s*:?\s*(.*)$/i;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(header);
    if (m) {
      const key = m[1].toUpperCase();
      const meta = SOAP_LABELS[key] ?? { label: m[2], sub: '' };
      current = { key, label: meta.label, sub: meta.sub, lines: [] };
      sections.push(current);
      const rest = m[3].trim();
      if (rest) current.lines.push(...splitBullets(rest));
    } else if (current) {
      current.lines.push(...splitBullets(line));
    }
  }
  return sections;
}

/** Split a section blob into bullet lines on sentence boundaries. */
function splitBullets(s: string): string[] {
  const parts = s
    .split(/(?<=[.;])\s+(?=[A-Z0-9])/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length ? parts : [s];
}

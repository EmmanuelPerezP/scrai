import { Icon } from '@/components/Icon';
import { noteSourceMeta, noteStatusMeta } from '@/lib/design';

/** Small status chip with a colored dot — used in the notes list. */
export function StatusChip({ status }: { status: string }) {
  const s = noteStatusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-[20px] pl-[7px] pr-2 py-[3px] font-sans font-semibold text-[10.5px]"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.fg }} />
      {s.label}
    </span>
  );
}

/** Status pill with a Material icon — used in the note-detail topbar. */
export function StatusPill({ status }: { status: string }) {
  const s = noteStatusMeta(status);
  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-[20px] px-[9px] py-[3px] font-sans font-semibold text-[11px]"
      style={{ background: s.bg, color: s.fg }}
    >
      <Icon name={s.icon} size={14} />
      {s.label}
    </span>
  );
}

/** Source tag (Audio / Text) with its icon. */
export function SourceTag({ source }: { source: string }) {
  const s = noteSourceMeta(source);
  return (
    <span className="inline-flex items-center gap-1 font-mono font-medium text-[11px] text-faint">
      <Icon name={s.icon} size={15} />
      {s.label}
    </span>
  );
}

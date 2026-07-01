import type { NoteListItemDto } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { StatusChip, SourceTag } from '@/components/NoteChips';
import { formatShortTime } from '@/lib/design';

export function NoteCard({ note, active, onOpen }: { note: NoteListItemDto; active: boolean; onOpen: () => void }) {
  const p = note.patient;
  return (
    <button
      onClick={onOpen}
      className={`w-full text-left border-b border-line-soft border-l-[3px] py-[14px] pr-4 pl-[15px] cursor-pointer flex flex-col gap-[7px] ${
        active ? 'border-l-sage bg-[#f2f5ef]' : 'border-l-transparent bg-transparent hover:bg-sand'
      }`}
    >
      <div className="flex gap-[11px] items-start">
        <Avatar seed={note.patientId} first={p?.firstName} last={p?.lastName} size={34} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <div className="font-sans font-semibold text-[13.5px] text-body truncate">
              {p ? `${p.firstName} ${p.lastName}` : 'Unknown patient'}
            </div>
            <div className="font-mono text-[11px] text-faint whitespace-nowrap flex-none">
              {formatShortTime(note.createdAt)}
            </div>
          </div>
          <div className="font-sans font-medium text-[12px] text-[#7a7062] truncate">
            {note.title || 'Clinical note'}
          </div>
        </div>
      </div>
      <div className="font-sans text-[12.5px] leading-[1.5] text-muted line-clamp-2">
        {note.preview || '(no content)'}
      </div>
      <div className="flex items-center gap-2">
        <StatusChip status={note.status} />
        <SourceTag source={note.source} />
      </div>
    </button>
  );
}

import { Icon } from '@/components/Icon';
import { BTN_SAGE } from '@/lib/ui';

export function EmptyState({
  onNew,
  title = 'No note selected',
  message,
}: {
  onNew: () => void;
  title?: string;
  message?: string;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-[14px] p-8 text-center">
      <div className="w-16 h-16 rounded-[18px] bg-[#efeadf] flex items-center justify-center">
        <Icon name="description" size={32} style={{ color: '#b7ae9e' }} />
      </div>
      <div className="font-serif font-semibold text-[19px] text-ink-heading">{title}</div>
      <div className="font-sans text-[13.5px] text-muted max-w-[280px]">
        {message ?? 'Pick a note from the list or capture a new visit to get started.'}
      </div>
      <button className={`${BTN_SAGE} mt-1`} onClick={onNew}>
        <Icon name="add" size={20} />
        New clinical note
      </button>
    </div>
  );
}

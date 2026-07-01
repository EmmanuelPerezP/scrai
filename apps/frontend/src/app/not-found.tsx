import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { BTN_SAGE } from '@/lib/ui';

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-[14px] p-8 text-center">
      <div className="w-16 h-16 rounded-[18px] bg-[#efeadf] flex items-center justify-center">
        <Icon name="error" size={32} style={{ color: '#b7ae9e' }} />
      </div>
      <div className="font-serif font-semibold text-[19px] text-ink-heading">Page not found</div>
      <div className="font-sans text-[13.5px] text-muted max-w-[280px]">
        The page you’re looking for doesn’t exist.
      </div>
      <Link href="/" className={`${BTN_SAGE} mt-1 no-underline`}>
        <Icon name="arrow_back" size={20} />
        Back to notes
      </Link>
    </div>
  );
}

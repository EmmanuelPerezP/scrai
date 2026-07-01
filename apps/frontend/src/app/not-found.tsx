import Link from 'next/link';
import { Icon } from '@/components/Icon';

export default function NotFound() {
  return (
    <div className="empty" style={{ height: '100vh' }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: '#efeadf',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="error" size={32} style={{ color: '#b7ae9e' }} />
      </div>
      <div style={{ font: '600 19px var(--font-serif)', color: 'var(--ink-heading)' }}>Page not found</div>
      <div style={{ font: '400 13.5px var(--font-sans)', color: 'var(--muted)', maxWidth: 280 }}>
        The page you’re looking for doesn’t exist.
      </div>
      <Link href="/" className="btn-sage" style={{ marginTop: 4, textDecoration: 'none' }}>
        <Icon name="arrow_back" size={20} />
        Back to notes
      </Link>
    </div>
  );
}

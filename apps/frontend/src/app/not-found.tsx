import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="empty">
      <h2>Not found</h2>
      <p>The note or page you’re looking for doesn’t exist.</p>
      <Link href="/" className="btn">
        Back to notes
      </Link>
    </section>
  );
}

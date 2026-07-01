import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScrAI — AI Scribe Notes',
  description: 'Create and view AI-generated clinical notes associated with patients.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">
            Scr<span>AI</span> · Notes
          </Link>
          <Link href="/notes/new" className="btn">
            + New note
          </Link>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}

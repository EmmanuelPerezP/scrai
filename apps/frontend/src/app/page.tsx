import Link from 'next/link';
import { NotesService } from '@/lib/api';
import { SourceBadge, StatusBadge } from '@/components/Badges';
import { formatDateTime, patientFullName } from '@/lib/format';

// Always fetch fresh data — notes change as the user adds them.
// force-dynamic makes the route dynamic; force-no-store also opts the
// underlying data fetches out of Next's Data Cache (needed because the
// generated client calls fetch() without a cache option).
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function NotesListPage() {
  const notes = await NotesService.listNotes();

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ margin: '4px 0 18px' }}>Clinical notes</h1>
        <span className="meta">{notes.length} total</span>
      </div>

      {notes.length === 0 ? (
        <div className="empty">
          <p>No notes yet.</p>
          <Link href="/notes/new" className="btn">
            Create your first note
          </Link>
        </div>
      ) : (
        notes.map((note) => (
          <Link key={note.id} href={`/notes/${note.id}`} className="note-row">
            <div className="row-head">
              <span className="patient-name">
                {note.patient ? patientFullName(note.patient) : 'Unknown patient'}
              </span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <SourceBadge source={note.source} />
                <StatusBadge status={note.status} />
              </span>
            </div>
            <div className="meta" style={{ marginBottom: 6 }}>
              {note.title ? `${note.title} · ` : ''}
              {formatDateTime(note.createdAt)}
            </div>
            <div className="preview">{note.preview || '(no content)'}</div>
          </Link>
        ))
      )}
    </section>
  );
}

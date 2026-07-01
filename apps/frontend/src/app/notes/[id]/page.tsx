import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, NotesService, PatientsService } from '@/lib/api';
import { SourceBadge, StatusBadge } from '@/components/Badges';
import { formatDate, formatDateTime, patientFullName } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function NoteDetailPage({ params }: { params: { id: string } }) {
  const note = await NotesService.getNote({ id: params.id }).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });

  // Fetch patient explicitly for a fully-typed sidebar.
  const patient = await PatientsService.getPatient({ id: note.patientId }).catch(() => null);

  return (
    <section>
      <Link href="/" className="meta">
        ← Back to notes
      </Link>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '12px 0 18px' }}>
        <h1 style={{ margin: 0 }}>{note.title || 'Clinical note'}</h1>
        <SourceBadge source={note.source} />
        <StatusBadge status={note.status} />
      </div>
      <div className="meta" style={{ marginBottom: 18 }}>
        Created {formatDateTime(note.createdAt)}
      </div>

      <div className="detail-grid">
        <div>
          {note.status === 'failed' && note.error ? (
            <div className="card" style={{ marginBottom: 16 }}>
              <p className="section-title">Processing error</p>
              <p className="error">{note.error}</p>
            </div>
          ) : null}

          {note.audioUrl ? (
            <div className="card" style={{ marginBottom: 16 }}>
              <p className="section-title">Audio {note.audioFilename ? `· ${note.audioFilename}` : ''}</p>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio controls src={note.audioUrl} style={{ width: '100%' }} />
            </div>
          ) : null}

          {note.processedText ? (
            <div className="card" style={{ marginBottom: 16 }}>
              <p className="section-title">AI summary (SOAP)</p>
              <pre className="note-text">{note.processedText}</pre>
            </div>
          ) : null}

          <div className="card">
            <p className="section-title">
              {note.source === 'audio' ? 'Transcription' : 'Note text'}
            </p>
            <pre className="note-text">{note.rawText || '(no content)'}</pre>
          </div>
        </div>

        <aside className="card">
          <p className="section-title">Patient</p>
          {patient ? (
            <dl className="patient-meta">
              <dt>Name</dt>
              <dd>{patientFullName(patient)}</dd>
              <dt>MRN</dt>
              <dd>{patient.mrn}</dd>
              <dt>Date of birth</dt>
              <dd>{formatDate(patient.dateOfBirth)}</dd>
              <dt>Sex</dt>
              <dd style={{ textTransform: 'capitalize' }}>{patient.sex}</dd>
              {patient.address ? (
                <>
                  <dt>Address</dt>
                  <dd>{patient.address}</dd>
                </>
              ) : null}
              {patient.primaryConditions ? (
                <>
                  <dt>Conditions</dt>
                  <dd>{patient.primaryConditions}</dd>
                </>
              ) : null}
            </dl>
          ) : (
            <p className="meta">Patient details unavailable.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

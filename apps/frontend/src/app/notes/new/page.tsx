import Link from 'next/link';
import { PatientsService } from '@/lib/api';
import { NoteForm } from '@/components/NoteForm';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function NewNotePage() {
  const patients = await PatientsService.listPatients();

  return (
    <section style={{ maxWidth: 640 }}>
      <Link href="/" className="meta">
        ← Back to notes
      </Link>
      <h1 style={{ margin: '12px 0 18px' }}>New note</h1>
      <NoteForm
        patients={patients.map((p) => ({
          id: p.id,
          label: `${p.lastName}, ${p.firstName} (${p.mrn})`,
        }))}
      />
    </section>
  );
}

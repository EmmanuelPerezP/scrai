'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, NotesService } from '@/lib/api';

type PatientOption = { id: string; label: string };
type Mode = 'text' | 'audio';

export function NoteForm({ patients }: { patients: PatientOption[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('text');
  const [patientId, setPatientId] = useState(patients[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [summarize, setSummarize] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!patientId) {
      setError('Please select a patient.');
      return;
    }
    if (mode === 'text' && text.trim().length === 0) {
      setError('Please enter some note text.');
      return;
    }
    if (mode === 'audio' && !file) {
      setError('Please choose an audio file.');
      return;
    }

    setSubmitting(true);
    try {
      const note =
        mode === 'text'
          ? await NotesService.createTextNote({
              requestBody: { patientId, title: title || undefined, text, summarize },
            })
          : await NotesService.createAudioNote({
              formData: { patientId, title: title || undefined, summarize, file: file as Blob },
            });
      router.push(`/notes/${note.id}`);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? `${err.status}: ${JSON.stringify(err.body)}`
          : err instanceof Error
            ? err.message
            : 'Something went wrong';
      setError(message);
      setSubmitting(false);
    }
  }

  if (patients.length === 0) {
    return <p className="error">No patients found. Seed the database first.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <label htmlFor="patient">Patient</label>
      <select id="patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
        {patients.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </select>

      <label htmlFor="title">Title (optional)</label>
      <input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Home visit follow-up"
      />

      <label>Input type</label>
      <div style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
        <label className="field-row" style={{ margin: 0 }}>
          <input
            type="radio"
            name="mode"
            checked={mode === 'text'}
            onChange={() => setMode('text')}
          />
          Typed text
        </label>
        <label className="field-row" style={{ margin: 0 }}>
          <input
            type="radio"
            name="mode"
            checked={mode === 'audio'}
            onChange={() => setMode('audio')}
          />
          Audio upload
        </label>
      </div>

      {mode === 'text' ? (
        <>
          <label htmlFor="text">Note text</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe the visit, symptoms, observations..."
          />
        </>
      ) : (
        <>
          <label htmlFor="file">Audio file</label>
          <input
            id="file"
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </>
      )}

      <label className="field-row" style={{ marginTop: 16 }}>
        <input
          type="checkbox"
          checked={summarize}
          onChange={(e) => setSummarize(e.target.checked)}
        />
        Generate AI SOAP summary
      </label>

      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Processing…' : 'Create note'}
        </button>
      </div>

      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}

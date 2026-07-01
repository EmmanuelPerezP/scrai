import type { Patient } from '@/lib/api';
import { Icon } from '@/components/Icon';
import { avatarTint, computeAge, formatDob, initials } from '@/lib/design';

export function PatientSidebar({ patient }: { patient: Patient | null }) {
  if (!patient) {
    return (
      <aside className="sidebar">
        <div className="eyebrow" style={{ marginBottom: 16 }}>
          Patient
        </div>
        <div style={{ color: 'var(--muted)', font: '400 13px var(--font-sans)' }}>
          Patient details unavailable.
        </div>
      </aside>
    );
  }

  const tint = avatarTint(patient.id);
  const age = computeAge(patient.dateOfBirth);
  const facts: { label: string; value: string; mono?: boolean }[] = [
    { label: 'MRN', value: patient.mrn, mono: true },
    { label: 'Date of birth', value: `${formatDob(patient.dateOfBirth)}${age != null ? ` · ${age}y` : ''}` },
    { label: 'Sex', value: capitalize(patient.sex) },
  ];
  if (patient.address) facts.push({ label: 'Address', value: patient.address });

  return (
    <aside className="sidebar">
      <div className="eyebrow" style={{ marginBottom: 16 }}>
        Patient
      </div>

      <div style={{ display: 'flex', gap: 13, alignItems: 'center', marginBottom: 16 }}>
        <div className="avatar" style={{ width: 52, height: 52, background: tint.bg, color: tint.fg, fontSize: 18 }}>
          {initials(patient.firstName, patient.lastName)}
        </div>
        <div>
          <div style={{ font: '600 18px/1.15 var(--font-serif)', color: 'var(--ink-heading)' }}>
            {patient.firstName} {patient.lastName}
          </div>
          <div className="mono" style={{ fontSize: 12, fontWeight: 500, color: '#94897a', marginTop: 2 }}>
            {patient.mrn} · {capitalize(patient.sex)}
          </div>
        </div>
      </div>

      {patient.primaryConditions ? (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 11px',
            borderRadius: 8,
            background: 'var(--sage-tint)',
            color: '#3c5440',
            font: '600 12px var(--font-sans)',
            marginBottom: 18,
          }}
        >
          <Icon name="cardiology" size={16} />
          {patient.primaryConditions}
        </div>
      ) : null}

      <div className="facts" style={{ marginBottom: 14 }}>
        {facts.map((f) => (
          <div className="fact" key={f.label}>
            <div className="fact__label">{f.label}</div>
            <div className={`fact__value${f.mono ? ' mono' : ''}`}>{f.value}</div>
          </div>
        ))}
      </div>

      {patient.primaryConditions ? (
        <div className="info-card" style={{ marginBottom: 14 }}>
          <Icon name="clinical_notes" />
          <div>
            <div
              style={{
                font: '600 12px var(--font-sans)',
                color: '#9a4f2e',
                textTransform: 'uppercase',
                letterSpacing: '.04em',
              }}
            >
              Primary conditions
            </div>
            <div style={{ font: '500 13.5px var(--font-sans)', color: '#6e4127', marginTop: 2 }}>
              {patient.primaryConditions}
            </div>
          </div>
        </div>
      ) : null}

      <button className="btn-outline">
        <Icon name="folder_shared" size={18} />
        View full chart
      </button>
    </aside>
  );
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

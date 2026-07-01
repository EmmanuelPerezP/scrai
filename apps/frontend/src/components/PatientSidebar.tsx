import type { Patient } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { Icon } from '@/components/Icon';
import { capitalize, computeAge, formatDob } from '@/lib/design';
import { BTN_OUTLINE, EYEBROW } from '@/lib/ui';

export function PatientSidebar({ patient }: { patient: Patient | null }) {
  if (!patient) {
    return (
      <aside className="w-[322px] flex-none bg-paper border-l border-line overflow-y-auto pt-[22px] px-5 pb-8">
        <div className={`${EYEBROW} mb-4`}>Patient</div>
        <div className="font-sans text-[13px] text-muted">Patient details unavailable.</div>
      </aside>
    );
  }

  const age = computeAge(patient.dateOfBirth);
  const facts: { label: string; value: string; mono?: boolean }[] = [
    { label: 'MRN', value: patient.mrn, mono: true },
    { label: 'Date of birth', value: `${formatDob(patient.dateOfBirth)}${age != null ? ` · ${age}y` : ''}` },
    { label: 'Sex', value: capitalize(patient.sex) },
  ];
  if (patient.address) facts.push({ label: 'Address', value: patient.address });

  return (
    <aside className="w-[322px] flex-none bg-paper border-l border-line overflow-y-auto pt-[22px] px-5 pb-8">
      <div className={`${EYEBROW} mb-4`}>Patient</div>

      <div className="flex gap-[13px] items-center mb-4">
        <Avatar seed={patient.id} first={patient.firstName} last={patient.lastName} size={52} fontSize={18} />
        <div>
          <div className="font-serif font-semibold text-[18px] leading-[1.15] text-ink-heading">
            {patient.firstName} {patient.lastName}
          </div>
          <div className="font-mono font-medium text-[12px] text-[#94897a] mt-0.5">
            {patient.mrn} · {capitalize(patient.sex)}
          </div>
        </div>
      </div>

      {patient.primaryConditions ? (
        <div className="inline-flex items-center gap-1.5 px-[11px] py-[5px] rounded-lg bg-sage-tint text-[#3c5440] font-sans font-semibold text-xs mb-[18px]">
          <Icon name="cardiology" size={16} />
          {patient.primaryConditions}
        </div>
      ) : null}

      <div className="bg-white border border-line-card rounded-[13px] overflow-hidden mb-[14px]">
        {facts.map((f) => (
          <div
            key={f.label}
            className="flex items-center justify-between gap-3 px-[14px] py-[11px] border-b border-[#f1ebdf] last:border-b-0"
          >
            <div className="font-sans text-[12.5px] text-[#948a7b]">{f.label}</div>
            <div className={`font-medium text-[13px] text-body-soft text-right ${f.mono ? 'font-mono' : 'font-sans'}`}>
              {f.value}
            </div>
          </div>
        ))}
      </div>

      {patient.primaryConditions ? (
        <div className="flex gap-[10px] items-start px-[14px] py-3 bg-warn-bg border border-warn-border rounded-xl mb-[14px]">
          <Icon name="clinical_notes" size={19} style={{ color: '#b0603c', marginTop: 1 }} />
          <div>
            <div className="font-sans font-semibold text-[12px] text-[#9a4f2e] uppercase tracking-[0.04em]">
              Primary conditions
            </div>
            <div className="font-sans font-medium text-[13.5px] text-[#6e4127] mt-0.5">{patient.primaryConditions}</div>
          </div>
        </div>
      ) : null}

      <button className={BTN_OUTLINE}>
        <Icon name="folder_shared" size={18} />
        View full chart
      </button>
    </aside>
  );
}

import { Icon } from '@/components/Icon';

const NAV = [
  { icon: 'clinical_notes', title: 'Notes', active: true },
  { icon: 'groups', title: 'Patients' },
  { icon: 'calendar_month', title: 'Schedule' },
  { icon: 'article', title: 'Templates' },
];

const RAIL_BTN =
  'w-[46px] h-[46px] rounded-[13px] flex items-center justify-center cursor-pointer';

/** Left icon rail. Only "Notes" is wired; the rest are design placeholders. */
export function Rail() {
  return (
    <nav className="w-[70px] flex-none bg-paper border-r border-line flex flex-col items-center py-4 gap-1 z-[2]">
      <div
        className="w-10 h-10 rounded-xl bg-sage flex items-center justify-center mb-3 shadow-[0_3px_8px_rgba(76,107,82,0.32)]"
        title="ScrAI"
      >
        <Icon name="graphic_eq" size={23} style={{ color: '#fff' }} />
      </div>
      {NAV.map((item) => (
        <button
          key={item.title}
          title={item.title}
          className={`${RAIL_BTN} ${
            item.active
              ? 'bg-sage-tint text-sage'
              : 'bg-transparent text-[#94897a] hover:bg-[#f0eadb] hover:text-secondary'
          }`}
        >
          <Icon name={item.icon} size={22} />
        </button>
      ))}
      <div className="flex-1" />
      <button
        title="Help"
        className={`${RAIL_BTN} bg-transparent text-[#94897a] hover:bg-[#f0eadb] hover:text-secondary`}
      >
        <Icon name="help" size={22} />
      </button>
      <div
        className="w-[34px] h-[34px] rounded-full bg-[#efe6ce] text-[#7a6326] flex items-center justify-center font-sans font-semibold text-xs mt-1.5"
        title="Riley Nolan, RN"
      >
        RN
      </div>
    </nav>
  );
}

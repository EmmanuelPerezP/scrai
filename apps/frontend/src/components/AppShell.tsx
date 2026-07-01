'use client';

import { Icon, Waveform } from '@/components/Icon';
import { EmptyState } from '@/components/EmptyState';
import { NoteCard } from '@/components/NoteCard';
import { NoteComposer } from '@/components/NoteComposer';
import { NoteDetailView } from '@/components/NoteDetailView';
import { Processing } from '@/components/Processing';
import { Rail } from '@/components/Rail';
import { useNotesApp } from '@/hooks/useNotesApp';
import { BTN_SAGE } from '@/lib/ui';

export function AppShell() {
  const app = useNotesApp();

  return (
    <div className="flex h-screen w-full min-w-[1180px] overflow-hidden">
      <Rail />

      {/* notes list column */}
      <div className="w-[344px] flex-none bg-paper border-r border-line flex flex-col overflow-hidden">
        <div className="pt-5 px-[18px] pb-3">
          <div className="flex items-baseline justify-between mb-[3px]">
            <div className="font-serif font-semibold text-[21px] leading-none text-body">Notes</div>
            <div className="font-mono font-medium text-[12px] text-[#94897a]">{app.notes.length} total</div>
          </div>
          <div className="font-sans text-[12.5px] text-[#94897a] mb-[14px]">Home Health · Field Documentation</div>
          <button className={`${BTN_SAGE} w-full`} onClick={app.startNewNote}>
            <Icon name="add" size={20} />
            New clinical note
          </button>
          <div className="relative mt-3">
            <Icon
              name="search"
              size={19}
              className="absolute left-[11px] top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#aea595' }}
            />
            <input
              value={app.search}
              onChange={(e) => app.setSearch(e.target.value)}
              placeholder="Search notes or patients"
              className="w-full pl-9 pr-3 py-[9px] border border-line bg-white rounded-[10px] font-sans text-[13.5px] text-body focus:border-sage"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto border-t border-line-soft">
          {app.loading ? (
            <ListMessage>Loading…</ListMessage>
          ) : app.filtered.length === 0 ? (
            <ListMessage>{app.notes.length === 0 ? 'No notes yet.' : 'No matches.'}</ListMessage>
          ) : (
            app.filtered.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                active={n.id === app.activeId && app.view === 'note'}
                onOpen={() => app.openNote(n.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* main panel */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
        {app.view === 'newNote' ? (
          <NoteComposer patients={app.patients} onClose={app.closeComposer} onGenerate={app.generate} />
        ) : app.view === 'processing' ? (
          <Processing mode={app.pipeMode} step={app.pipeStep} />
        ) : app.loadError ? (
          <EmptyState message={app.loadError} onNew={app.startNewNote} title="Couldn’t reach the API" />
        ) : app.detailLoading && !app.detail ? (
          <div className="h-full flex items-center justify-center p-8">
            <Waveform />
          </div>
        ) : app.detail && app.activeId ? (
          <NoteDetailView key={app.detail.id} note={app.detail} patient={app.activePatient} />
        ) : (
          <EmptyState onNew={app.startNewNote} />
        )}
      </div>
    </div>
  );
}

function ListMessage({ children }: { children: React.ReactNode }) {
  return <div className="p-6 font-sans text-[13px] text-muted">{children}</div>;
}

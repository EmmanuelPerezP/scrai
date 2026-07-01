import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { BTN_SAGE } from '@/lib/ui';

const NAV_LINKS = ['Platform', 'Security', 'Customers', 'Pricing'];

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="w-8 h-8 rounded-[10px] bg-sage flex items-center justify-center shadow-[0_3px_8px_rgba(76,107,82,0.32)]">
        <Icon name="graphic_eq" size={19} style={{ color: '#fff' }} />
      </div>
      <span className={`font-serif font-semibold text-[19px] ${dark ? 'text-[#F4EEE4]' : 'text-ink-heading'}`}>ScrAI</span>
    </div>
  );
}

export function Landing() {
  return (
    <div className="bg-sand min-h-screen text-body">
      {/* ---------- nav ---------- */}
      <nav className="w-full bg-paper border-b border-line">
        <div className="max-w-[1140px] mx-auto px-6 h-[68px] flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <span key={l} className="font-sans font-medium text-[15px] text-secondary cursor-pointer hover:text-body">
                {l}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline font-sans font-medium text-[15px] text-secondary cursor-pointer hover:text-body">
              Sign in
            </span>
            <Link href="/app" className={`${BTN_SAGE} no-underline`}>
              Try the live demo
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ---------- hero ---------- */}
      <section className="px-6 pt-[72px] pb-10 text-center">
        <div className="max-w-[860px] mx-auto">
          <span className="inline-flex items-center rounded-full bg-paper border border-line px-[14px] py-[6px] font-mono text-[12.5px] uppercase tracking-[0.08em] text-faint mb-7">
            For home health &amp; hospice teams
          </span>
          <h1 className="font-serif font-medium text-[clamp(38px,6vw,62px)] leading-[1.06] tracking-[-0.015em] text-ink-heading">
            Give clinicians back the hour they lose to <span className="italic text-sage">charting.</span>
          </h1>
          <p className="max-w-[620px] mx-auto font-sans text-[19.5px] leading-[1.5] text-[#635a4e] mt-6">
            ScrAI turns a home-visit recording into a structured, review-ready SOAP note in under a minute — so your
            nurses spend their evenings at home, not in the EHR.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <Link href="/app" className={`${BTN_SAGE} no-underline text-[15px] px-5 py-3`}>
              Try the live demo
              <Icon name="arrow_forward" size={18} />
            </Link>
            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-[11px] border border-line bg-white text-secondary font-sans font-semibold text-[15px] cursor-pointer hover:bg-paper">
              <Icon name="play_circle" size={20} />
              Watch 2-min overview
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 mt-9 font-sans text-[13.5px] text-muted">
            {[
              ['verified_user', 'HIPAA compliant'],
              ['check_circle', 'SOC 2 Type II'],
              ['description', 'BAA available'],
            ].map(([icon, label]) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <Icon name={icon} size={17} style={{ color: '#4f6b52' }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <HeroMock />
      </section>

      {/* ---------- stat strip ---------- */}
      <section className="px-6 py-[54px] border-y border-line bg-paper/60">
        <div className="max-w-[900px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            ['~2 hrs', 'saved per clinician, per day'],
            ['45 sec', 'average note turnaround'],
            ['98%', 'notes accepted after review'],
          ].map(([stat, label]) => (
            <div key={label}>
              <div className="font-serif font-medium text-[44px] leading-none text-sage">{stat}</div>
              <div className="font-sans text-[14px] text-secondary mt-2">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="px-6 py-[76px]">
        <div className="max-w-[1080px] mx-auto">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="font-serif font-medium text-[clamp(28px,4vw,40px)] text-ink-heading mt-3 mb-12 max-w-[620px]">
            From visit to chart in three steps.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StepCard
              n="01"
              icon="mic"
              title="Record or type the visit"
              body="Upload an audio recording from the home visit, or type free-text notes. Works offline and syncs later."
            />
            <StepCard
              n="02"
              icon="auto_awesome"
              iconClay
              title="ScrAI transcribes & structures"
              body="Whisper transcribes the audio; a clinical model shapes it into a clean, SOAP-format note tied to the right patient."
            />
            <StepCard
              n="03"
              icon="task_alt"
              title="Review, sign & sync"
              body="The clinician reviews, edits if needed, and signs. The finished note flows to your EHR with a full audit trail."
            />
          </div>
        </div>
      </section>

      {/* ---------- audio → SOAP ---------- */}
      <section className="px-6 py-[76px] bg-sand-deep">
        <div className="max-w-[1080px] mx-auto">
          <Eyebrow>See it work</Eyebrow>
          <h2 className="font-serif font-medium text-[clamp(28px,4vw,40px)] text-ink-heading mt-3 mb-3 max-w-[640px]">
            Speak naturally. ScrAI does the paperwork.
          </h2>
          <p className="font-sans text-[16px] text-secondary max-w-[560px] mb-10">
            The same visit, two ways: what the clinician said, and the structured note ScrAI produced.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            <div className="bg-white border border-line-card rounded-[18px] p-6">
              <div className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.05em] text-faint mb-5">
                <Icon name="graphic_eq" size={17} style={{ color: '#4f6b52' }} />
                Visit recording · 0:47
              </div>
              {[
                ['Clinician', '“How’s your breathing been this week, Dorothy?”', '#4f6b52'],
                ['Patient', '“Not too bad. I get winded on the stairs, but sitting I’m fine.”', '#a85636'],
                ['Clinician', '“Let me check your oxygen and listen. Show me how you use the rescue inhaler…”', '#4f6b52'],
              ].map(([who, line, col], i) => (
                <div key={i} className="flex gap-3 mb-4">
                  <div className="w-[64px] flex-none text-right font-mono font-semibold text-[11px] uppercase" style={{ color: col }}>
                    {who}
                  </div>
                  <div className="flex-1 pl-[15px] border-l-2 font-sans text-[14.5px] leading-[1.6] text-body-soft" style={{ borderColor: col }}>
                    {line}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-line-card rounded-[18px] p-6">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center gap-1.5 font-sans font-semibold text-[12.5px] text-clay-deep">
                  <Icon name="auto_awesome" size={16} />
                  ScrAI · Structured SOAP note
                </span>
                <span className="inline-flex items-center gap-1 font-sans font-semibold text-[11.5px] text-sage">
                  <Icon name="check" size={15} />
                  Ready to review
                </span>
              </div>
              {[
                ['S', 'Mild dyspnea on exertion, stable at rest. Occasional morning cough.'],
                ['O', 'SpO₂ 94% RA · RR 18 · mild expiratory wheeze bilaterally.'],
                ['A', 'COPD, stable — no signs of acute exacerbation.'],
                ['P', 'Continue maintenance inhaler; reviewed technique; RN follow-up in 1 week.'],
              ].map(([k, line]) => (
                <div key={k} className="flex gap-3 py-[7px]">
                  <div className="w-7 h-7 flex-none rounded-lg bg-sage-tint text-sage flex items-center justify-center font-serif font-semibold text-[14px]">
                    {k}
                  </div>
                  <div className="font-sans text-[14px] leading-[1.5] text-body-soft pt-0.5">{line}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- security ---------- */}
      <section className="px-6 py-[76px]">
        <div className="max-w-[1080px] mx-auto">
          <Eyebrow>Security &amp; compliance</Eyebrow>
          <h2 className="font-serif font-medium text-[clamp(28px,4vw,40px)] text-ink-heading mt-3 mb-3 max-w-[640px]">
            Built for compliance from the first recording.
          </h2>
          <p className="font-sans text-[16px] text-secondary max-w-[600px] mb-10">
            PHI never leaves your control. Every note carries a full audit trail and requires clinician sign-off before it
            enters the chart.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SecurityCard icon="verified_user" title="HIPAA & BAA" body="Signed Business Associate Agreement for every customer." />
            <SecurityCard icon="encrypted" title="Encrypted end-to-end" body="AES-256 at rest, TLS 1.3 in transit. Audio auto-purged after processing." />
            <SecurityCard icon="fact_check" title="SOC 2 Type II" body="Independently audited controls, reviewed annually." />
            <SecurityCard icon="history_edu" title="Full audit trail" body="Every edit, sign-off, and access is logged and exportable." />
          </div>
        </div>
      </section>

      {/* ---------- final CTA ---------- */}
      <section className="px-6 py-[80px] bg-sage">
        <div className="max-w-[720px] mx-auto text-center">
          <h2 className="font-serif font-medium text-[clamp(28px,4vw,40px)] text-[#F4EEE4]">
            Ready to give your team their evenings back?
          </h2>
          <p className="font-sans text-[17px] text-[#e7eee4] mt-4 mb-8">
            See how ScrAI fits your home-health workflow in a 20-minute walkthrough.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[11px] bg-[#F4EEE4] text-sage-deep font-sans font-semibold text-[15px] no-underline hover:bg-white"
            >
              Try the live demo
              <Icon name="arrow_forward" size={18} />
            </Link>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-[11px] border border-[#7f9a82] text-[#F4EEE4] font-sans font-semibold text-[15px] cursor-pointer hover:bg-sage-deep">
              Book a demo
            </button>
          </div>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="bg-[#211C15] px-6 pt-14 pb-8">
        <div className="max-w-[1080px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Logo dark />
            <p className="font-sans text-[13.5px] leading-[1.6] text-[#a99f8e] mt-4 max-w-[280px]">
              AI clinical documentation for home health &amp; hospice. Made for the visit, not the desk.
            </p>
          </div>
          {[
            ['Product', ['Platform', 'Security', 'Pricing', 'Changelog']],
            ['Company', ['About', 'Customers', 'Careers', 'Contact']],
            ['Legal', ['Privacy', 'Terms', 'HIPAA', 'BAA']],
          ].map(([title, links]) => (
            <div key={title as string}>
              <div className="font-sans font-semibold text-[13px] text-[#F4EEE4] mb-3">{title}</div>
              <ul className="space-y-2">
                {(links as string[]).map((l) => (
                  <li key={l} className="font-sans text-[13px] text-[#a99f8e] cursor-pointer hover:text-[#F4EEE4]">
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-[1080px] mx-auto mt-10 pt-6 border-t border-[#3a3226] flex flex-wrap justify-between gap-2 font-sans text-[12.5px] text-[#8a8175]">
          <span>© 2026 ScrAI, Inc.</span>
          <span>Protected health information handled under signed BAA.</span>
        </div>
      </footer>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="font-mono font-semibold text-[12.5px] uppercase tracking-[0.1em] text-clay-deep">{children}</div>;
}

function StepCard({ n, icon, title, body, iconClay }: { n: string; icon: string; title: string; body: string; iconClay?: boolean }) {
  return (
    <div className="bg-paper border border-line rounded-[18px] p-6 relative overflow-hidden">
      <div className="absolute right-4 top-2 font-serif font-medium text-[54px] text-[#dad0be] select-none">{n}</div>
      <div className="w-11 h-11 rounded-[12px] bg-sage-tint flex items-center justify-center mb-5">
        <Icon name={icon} size={23} style={{ color: iconClay ? '#bc6a47' : '#4f6b52' }} />
      </div>
      <div className="font-serif font-semibold text-[19px] text-ink-heading mb-2">{title}</div>
      <div className="font-sans text-[14.5px] leading-[1.55] text-secondary">{body}</div>
    </div>
  );
}

function SecurityCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="bg-paper border border-line rounded-[16px] p-5">
      <Icon name={icon} size={24} style={{ color: '#4f6b52' }} />
      <div className="font-serif font-semibold text-[16.5px] text-ink-heading mt-3 mb-1.5">{title}</div>
      <div className="font-sans text-[13.5px] leading-[1.5] text-secondary">{body}</div>
    </div>
  );
}

function HeroMock() {
  return (
    <div className="max-w-[1000px] mx-auto mt-14 relative">
      <div className="bg-paper border border-line rounded-[20px] shadow-[0_30px_70px_-30px_rgba(38,32,25,0.4)] overflow-hidden text-left">
        {/* topbar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
          <div className="w-9 h-9 rounded-full bg-[#f2e1d6] text-[#9c5334] flex items-center justify-center font-sans font-semibold text-[13px]">
            DN
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-serif font-semibold text-[16px] text-ink-heading">COPD Home Visit — Check-in</div>
            <div className="font-mono text-[11.5px] text-faint">Dorothy Nguyen · PT-1044 · Audio 4:12</div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-[11px] py-[5px] rounded-[20px] bg-clay-tint text-clay-deep font-sans font-semibold text-[11.5px]">
            <Icon name="auto_awesome" size={15} />
            AI-generated
          </span>
        </div>
        {/* body */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_260px]">
          <div className="p-6 md:border-r border-line">
            {[
              ['S', 'Subjective', '74 y/o female with COPD, routine home check-in. Reports mild dyspnea on exertion, stable at rest. No change in sputum color or volume.'],
              ['O', 'Objective', 'SpO₂ 94% on room air, RR 18, HR 82, BP 128/76. Mild expiratory wheeze bilaterally; no accessory muscle use.'],
            ].map(([k, label, text]) => (
              <div key={k} className="flex gap-3 mb-5 last:mb-0">
                <div className="w-8 h-8 flex-none rounded-lg bg-sage-tint text-sage flex items-center justify-center font-serif font-semibold text-[15px]">
                  {k}
                </div>
                <div>
                  <div className="font-sans font-semibold text-[14px] text-body mb-1">{label}</div>
                  <div className="font-sans text-[13.5px] leading-[1.55] text-body-soft">{text}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-white/40">
            <div className="font-mono font-semibold text-[10.5px] uppercase tracking-[0.09em] text-faint mb-3">Patient</div>
            <div className="font-serif font-semibold text-[16px] text-ink-heading">Dorothy Nguyen</div>
            <div className="font-mono text-[11.5px] text-muted mt-0.5 mb-4">Jul 22, 1951 · 74</div>
            {[
              ['Program', 'Chronic Care'],
              ['Payer', 'Medicare B'],
              ['Provider', 'Dr. Patel'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-1.5 border-b border-[#f1ebdf] last:border-b-0">
                <span className="font-sans text-[12.5px] text-[#948a7b]">{l}</span>
                <span className="font-sans font-medium text-[12.5px] text-body-soft">{v}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-[10px] bg-warn-bg text-[#9a4f2e] font-sans font-medium text-[12.5px]">
              <Icon name="warning" size={16} style={{ color: '#b0603c' }} />
              No known allergies
            </div>
          </div>
        </div>
      </div>
      {/* floating badge */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#211C15] text-[#F4EEE4] shadow-[0_12px_30px_-10px_rgba(38,32,25,0.6)] whitespace-nowrap">
        <Icon name="bolt" size={17} style={{ color: '#e6b45a' }} />
        <span className="font-sans text-[13px]">
          4:12 recording → SOAP note · <span className="text-[#a99f8e]">generated in 41 seconds</span>
        </span>
      </div>
    </div>
  );
}

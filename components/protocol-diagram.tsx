import { Bot, Fingerprint, Handshake, Ticket } from 'lucide-react';

function Peer({ name, org }: { name: string; org: string }) {
  return (
    <div className="rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-fd-card/40 p-4 text-center shadow-[0_0_16px_rgba(59,130,246,0.08)]">
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500 dark:text-blue-400">
        <Bot className="h-4 w-4" />
      </div>
      <div className="text-sm font-semibold text-fd-foreground">{name}</div>
      <div className="mt-0.5 text-[11px] text-fd-muted-foreground">{org}</div>
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {['AID', 'Manifest', 'Key'].map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-300"
          >
            <Fingerprint className="h-2.5 w-2.5" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProtocolDiagram() {
  return (
    <section className="relative overflow-hidden border-t py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.04),transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl px-4">
        <h2 className="mb-4 text-center text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
          What AITP Is{' '}
          <span className="bg-gradient-to-r from-blue-400 via-fd-primary to-violet-400 bg-clip-text text-transparent">
            Made Of
          </span>
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center text-fd-muted-foreground">
          Two agents, each with a verifiable <strong>identity</strong>, run a
          mutual <strong>handshake</strong> and walk away holding a pair of{' '}
          <strong>Trust Context Tokens</strong>.
        </p>

        <div className="rounded-2xl border border-fd-primary/15 bg-fd-card/40 p-6 sm:p-10">
          {/* Peers row */}
          <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-fd-muted-foreground/70">
            Peers
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
            <Peer name="Agent A" org="Org One" />

            {/* Handshake node */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-fd-primary/50 bg-gradient-to-br from-fd-primary/15 to-violet-500/10 text-fd-primary shadow-[0_0_20px_rgba(59,130,246,0.18)]">
                <Handshake className="h-5 w-5" />
              </div>
              <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-fd-primary">
                Handshake
              </span>
            </div>

            <Peer name="Agent B" org="Org Two" />
          </div>

          {/* Handshake message sequence */}
          <div className="mx-auto mt-8 max-w-xl rounded-xl border border-fd-primary/20 bg-fd-background/60 p-4">
            <div className="mb-3 text-center text-[10px] font-bold uppercase tracking-widest text-fd-muted-foreground/70">
              Four-message mutual handshake
            </div>
            <ol className="space-y-2">
              {[
                ['1', 'mutual_hello', 'A → B', 'Identity + nonce + requested grants'],
                ['2', 'mutual_hello', 'B → A', 'Identity + nonce + requested grants'],
                ['3', 'mutual_commit', 'A → B', 'Proof of possession + issued TCT'],
                ['4', 'mutual_commit', 'B → A', 'Proof of possession + issued TCT'],
              ].map(([n, msg, dir, desc]) => (
                <li key={n} className="flex items-center gap-3 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fd-primary/15 text-[10px] font-bold text-fd-primary">
                    {n}
                  </span>
                  <code className="shrink-0 rounded bg-fd-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-fd-primary">
                    {msg}
                  </code>
                  <span className="shrink-0 font-mono text-[11px] text-fd-muted-foreground">
                    {dir}
                  </span>
                  <span className="text-fd-muted-foreground">{desc}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Connector */}
          <div className="mx-auto flex h-10 w-full items-center justify-center">
            <svg viewBox="0 0 2 40" preserveAspectRatio="none" className="h-full w-[2px]" aria-hidden>
              <line x1="1" y1="0" x2="1" y2="40" stroke="currentColor" strokeWidth="1.5" className="text-fd-primary/50" />
            </svg>
          </div>

          {/* Outcome: pair of TCTs */}
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
            {['TCT for A', 'TCT for B'].map((label) => (
              <div
                key={label}
                className="rounded-xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-fd-card/50 p-4 text-center shadow-[0_0_24px_rgba(16,185,129,0.12)]"
              >
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Ticket className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-fd-foreground">{label}</div>
                <div className="mt-1 text-[11px] text-fd-muted-foreground">
                  Audience-bound &middot; Capability-scoped &middot; Time-limited
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { Monitor, FlaskConical, ArrowRight } from 'lucide-react';

export function RunSection() {
  return (
    <section className="relative overflow-hidden border-t py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-fd-card/60 via-fd-card/30 to-fd-background" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.06),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.04),transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl px-4">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
          {/* Left — headline */}
          <div className="lg:sticky lg:top-32">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fd-primary/20 bg-fd-primary/5 px-3 py-1 text-xs font-medium text-fd-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fd-primary" />
              Try it now
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-fd-foreground sm:text-4xl">
              Watch two agents{' '}
              <span className="bg-gradient-to-r from-blue-400 via-fd-primary to-violet-400 bg-clip-text text-transparent">
                build trust
              </span>
            </h2>
            <p className="max-w-sm text-fd-muted-foreground">
              See the handshake happen end-to-end with real LLM-powered agents —
              intra-org, cross-org, and cross-cloud — then inspect every
              envelope, token, and revocation as it flows.
            </p>
          </div>

          {/* Right — two options stacked */}
          <div className="flex flex-col gap-6">
            {/* Option 1: Console */}
            <Link
              href="https://console.agentidentitytrustprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl border border-fd-primary/20 transition-all duration-300 hover:border-fd-primary/40 hover:shadow-[0_0_50px_rgba(59,130,246,0.12)]">
                <div className="h-1 bg-gradient-to-r from-blue-400 via-fd-primary to-violet-400" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-5">
                    <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fd-primary/20 to-violet-500/15 text-fd-primary transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(59,130,246,0.3)]">
                      <Monitor className="h-6 w-6" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-fd-foreground transition-colors group-hover:text-fd-primary">
                          Open the hosted console
                        </h3>
                        <span className="rounded-full bg-fd-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fd-primary">
                          Live
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
                        A unified control panel for AITP deployments — launch
                        scenarios, watch handshakes and delegations resolve in
                        real time, browse the registry, and audit trust events
                        across the ecosystem.
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary opacity-0 transition-all duration-200 group-hover:opacity-100">
                        Open Console <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Option 2: Playground */}
            <Link href="/playground" className="group relative">
              <div className="relative overflow-hidden rounded-2xl border border-fd-border/60 transition-all duration-300 hover:border-fd-primary/40 hover:shadow-[0_0_50px_rgba(59,130,246,0.12)]">
                <div className="h-1 bg-gradient-to-r from-fd-border via-fd-muted-foreground/20 to-fd-border transition-all duration-500 group-hover:from-blue-400 group-hover:via-fd-primary group-hover:to-violet-400" />
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-5">
                    <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fd-primary/10 to-violet-500/5 text-fd-muted-foreground transition-all duration-300 group-hover:from-fd-primary/20 group-hover:to-violet-500/15 group-hover:text-fd-primary group-hover:shadow-[0_0_24px_rgba(59,130,246,0.2)]">
                      <FlaskConical className="h-6 w-6" />
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-fd-foreground transition-colors group-hover:text-fd-primary">
                        Run the playground locally
                      </h3>
                      <p className="mt-1 text-xs text-fd-muted-foreground">
                        FastAPI &middot; CrewAI &middot; LangChain &middot; LangGraph
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
                        Spin up scenario packs that drive the full AITP
                        handshake between real agents, with live event streams.
                        All protocol logic comes from the SDK — the playground
                        just orchestrates the peers.
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-fd-primary opacity-0 transition-all duration-200 group-hover:opacity-100">
                        Playground Guide <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

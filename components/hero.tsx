import Link from 'next/link';
import { SPEC_VERSION } from '@/lib/spec-version';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Layered gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fd-primary/20 via-fd-primary/8 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-500/12 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-400/8 via-transparent to-transparent" />
      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative mx-auto max-w-5xl px-4 py-24 sm:py-32">
        {/* Top section — headline + CTA */}
        <div className="text-center">
          {/* Logo mark with glow */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/30 to-violet-500/20 blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-fd-primary/25 bg-gradient-to-br from-blue-500/20 via-fd-primary/15 to-violet-500/20 backdrop-blur-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth={1.5}
                  className="h-8 w-8"
                >
                  <defs>
                    <linearGradient id="hero-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  <path
                    stroke="url(#hero-icon-gradient)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  />
                  <path
                    stroke="url(#hero-icon-gradient)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.5 12 2.5 2.5L15.5 10"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Current announcement */}
          <Link
            href="/news/aitp-0.3-freeze"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-fd-primary/25 bg-fd-primary/5 px-4 py-1.5 text-sm text-fd-foreground transition-colors hover:border-fd-primary/50"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-fd-primary" />
            aitp/0.3 wire freeze &middot; public review open
            <span className="text-fd-primary">&rarr;</span>
          </Link>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-fd-foreground sm:text-5xl lg:text-6xl">
            Agent Identity &amp;{' '}
            <span className="bg-gradient-to-r from-blue-400 via-fd-primary to-violet-400 bg-clip-text text-transparent">
              Trust
            </span>{' '}
            Protocol
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-fd-muted-foreground sm:text-xl">
            Agents are starting to act on each other&apos;s behalf — across
            companies, clouds, and trust boundaries. The missing piece is{' '}
            <em className="text-fd-foreground">knowing who you&apos;re
            talking to</em>, and what they&apos;re allowed to do. AITP is the
            open protocol that lets two autonomous agents establish mutual
            trust — with no shared verifier in between.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/quickstart"
              className="inline-flex items-center rounded-lg bg-fd-primary px-6 py-3 text-sm font-semibold text-fd-primary-foreground shadow-[0_0_16px_rgba(59,130,246,0.25)] transition-all duration-200 hover:shadow-[0_0_28px_rgba(59,130,246,0.4)]"
            >
              Quickstart
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center rounded-lg border border-fd-primary/20 bg-fd-background px-6 py-3 text-sm font-semibold text-fd-foreground shadow-[0_0_12px_rgba(59,130,246,0.06)] transition-all duration-200 hover:border-fd-primary/50 hover:shadow-[0_0_24px_rgba(59,130,246,0.2)]"
            >
              Docs
            </Link>
            <Link
              href="/spec"
              className="inline-flex items-center rounded-lg border border-fd-primary/20 bg-fd-background px-6 py-3 text-sm font-semibold text-fd-foreground shadow-[0_0_12px_rgba(59,130,246,0.06)] transition-all duration-200 hover:border-fd-primary/50 hover:shadow-[0_0_24px_rgba(59,130,246,0.2)]"
            >
              Read the Spec
            </Link>
            <Link
              href="/sdks"
              className="inline-flex items-center rounded-lg border border-fd-primary/20 bg-fd-background px-6 py-3 text-sm font-semibold text-fd-foreground shadow-[0_0_12px_rgba(59,130,246,0.06)] transition-all duration-200 hover:border-fd-primary/50 hover:shadow-[0_0_24px_rgba(59,130,246,0.2)]"
            >
              Explore SDKs
            </Link>
          </div>

          {/* Version badge */}
          <div className="mt-8">
            <span className="inline-flex items-center rounded-full border border-fd-primary/15 bg-fd-primary/5 px-3 py-1 text-xs font-medium text-fd-primary">
              {SPEC_VERSION} &middot; RFC-driven &middot; Community Standards Track
            </span>
          </div>
        </div>

        {/* The problem statement */}
        <div className="mx-auto mt-20 max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl p-[1px]">
            {/* Gradient border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/35 via-fd-primary/25 to-violet-500/30" />
            <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative rounded-[15px] bg-fd-background/90 p-8 backdrop-blur-md sm:p-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fd-primary/20 bg-fd-primary/5 px-3 py-1 text-xs font-medium text-fd-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fd-primary" />
                The Challenge
              </div>
              <h2 className="mb-4 text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
                Capability is everywhere.{' '}
                <span className="bg-gradient-to-r from-blue-400 via-fd-primary to-violet-400 bg-clip-text text-transparent">
                  Trust is missing.
                </span>
              </h2>
              <p className="max-w-2xl leading-relaxed text-fd-muted-foreground">
                When an agent calls another agent across an organizational
                boundary, today&apos;s answer is a shared API key, an OAuth
                client someone provisioned by hand, or a centralized broker both
                sides have to trust. None of that tells Agent A that Agent B is
                who it claims to be, that the message it sent was actually
                signed by it, or exactly which capabilities it has been granted
                — and for how long.
              </p>
            </div>
          </div>
        </div>

        {/* One strict invariant — from RFC-AITP-0001 */}
        <div className="mx-auto mt-12 max-w-3xl text-center">
          <div className="relative overflow-hidden rounded-xl border-x-4 border-fd-primary/50 bg-gradient-to-r from-fd-primary/8 via-fd-card/60 to-violet-500/8 px-6 py-5 sm:px-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)]" />
            <p className="relative text-fd-muted-foreground italic">
              &ldquo;Trust is bilateral and earned per peer. There is no shared
              root, no central authority — only two agents, each cryptographically
              proving who they are, and each issuing the other exactly the
              authority it&apos;s willing to grant.&rdquo;
            </p>
            <span className="relative mt-2 block text-xs not-italic text-fd-muted-foreground/70">
              &mdash; the core model from{' '}
              <Link href="/spec/core" className="text-fd-primary hover:underline">
                RFC-AITP-0001
              </Link>
            </span>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-fd-muted-foreground">
            AITP doesn&apos;t define what your agents do or how they reason —
            that&apos;s your application. What it defines is the{' '}
            <Link href="/spec/mutual-handshake" className="font-medium text-fd-primary hover:underline">
              handshake
            </Link>{' '}
            that turns two strangers into trusted peers, and the{' '}
            <Link href="/spec/tct" className="font-medium text-fd-primary hover:underline">
              tokens
            </Link>{' '}
            that make every grant explicit, scoped, and verifiable.
          </p>
        </div>

        {/* What AITP provides — three pillars */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
          {[
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ),
              label: 'Identity',
              text: 'Every agent has a self-certifying Agent Identifier (AID) bound to its public key, published in a signed Manifest. No registrar, no shared namespace — identity you can verify from first principles.',
              gradient: 'from-fd-primary/10 to-blue-400/5',
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
                </svg>
              ),
              label: 'Handshake',
              text: 'A four-message Mutual Handshake where each peer proves possession of its key and states what it will grant. Bidirectional, audience-bound, and replay-resistant — no third party in the trust path.',
              gradient: 'from-purple-500/10 to-fd-primary/5',
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
              label: 'Trust Tokens',
              text: 'The handshake yields a pair of signed Trust Context Tokens — each audience-bound, capability-scoped, and time-limited. Delegatable, revocable, and verifiable offline against the peer that issued them.',
              gradient: 'from-blue-400/10 to-purple-500/5',
            },
          ].map((pillar) => (
            <div
              key={pillar.label}
              className="group relative overflow-hidden rounded-xl border border-fd-primary/15 bg-fd-card/40 p-6 shadow-[0_0_20px_rgba(59,130,246,0.06)] transition-all duration-300 hover:border-fd-primary/40 hover:shadow-[0_0_36px_rgba(59,130,246,0.2)]"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${pillar.gradient} transition-opacity duration-300 group-hover:opacity-150`} />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-fd-primary/25 to-transparent transition-all duration-300 group-hover:via-fd-primary/60" />
              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fd-primary/10 text-fd-primary shadow-sm shadow-fd-primary/10 transition-all duration-300 group-hover:bg-fd-primary/25 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                    {pillar.icon}
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-wider text-fd-primary">
                    {pillar.label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-fd-muted-foreground">
                  {pillar.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Closing hook */}
        <p className="mx-auto mt-12 max-w-2xl text-center text-fd-muted-foreground">
          The web solved this for servers with{' '}
          <span className="font-medium text-fd-foreground">TLS and certificates</span>.
          AITP solves it for agents with{' '}
          <Link href="/docs/architecture" className="font-medium text-fd-primary hover:underline">
            verifiable identity
          </Link>
          ,{' '}
          <Link href="/spec/mutual-handshake" className="font-medium text-fd-primary hover:underline">
            a mutual handshake
          </Link>
          , and{' '}
          <Link href="/spec/delegation" className="font-medium text-fd-primary hover:underline">
            scoped, delegatable trust
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

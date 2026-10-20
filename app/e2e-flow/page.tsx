import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Bot,
  Search,
  Fingerprint,
  KeyRound,
  Ticket,
  ShieldCheck,
  Share2,
  Ban,
  ArrowRight,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const metadata: Metadata = {
  title: 'Handshake Walkthrough',
  description:
    'Follow two agents in different organizations from first contact through the AITP mutual handshake to a pair of Trust Context Tokens — then a scoped call, a delegation, and a revocation.',
};

function StepCard({
  n,
  icon,
  title,
  rfc,
  rfcHref,
  children,
}: {
  n: string;
  icon: ReactNode;
  title: string;
  rfc?: string;
  rfcHref?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-fd-primary/15 bg-fd-card/40 p-6 shadow-[0_0_24px_rgba(59,130,246,0.05)] sm:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] rounded-t-2xl bg-gradient-to-r from-transparent via-fd-primary/25 to-transparent" />
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fd-primary/20 to-violet-500/10 text-fd-primary">
          {icon}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-fd-muted-foreground/70">
          Step {n}
        </span>
        {rfc && rfcHref && (
          <Link
            href={rfcHref}
            className="ml-auto rounded-md bg-fd-primary/10 px-2 py-0.5 text-[11px] font-medium text-fd-primary hover:bg-fd-primary/20"
          >
            {rfc}
          </Link>
        )}
      </div>
      <h3 className="mb-2 text-xl font-bold tracking-tight text-fd-foreground">
        {title}
      </h3>
      <div className="space-y-3 text-sm leading-relaxed text-fd-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export default function E2EFlowPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fd-primary/15 via-fd-primary/5 to-transparent" />
          <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fd-primary/20 bg-fd-primary/5 px-3 py-1 text-xs font-medium text-fd-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fd-primary" />
              End-to-end walkthrough
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-fd-foreground sm:text-5xl">
              How two agents{' '}
              <span className="bg-gradient-to-r from-blue-400 via-fd-primary to-violet-400 bg-clip-text text-transparent">
                establish trust
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-fd-muted-foreground">
              <strong className="text-fd-foreground">Planner</strong> is an
              orchestration agent at Org One. <strong className="text-fd-foreground">Indexer</strong>{' '}
              is a data-retrieval agent at Org Two, in a different cloud. They
              have never met and share no secret. Here is how AITP gets them to
              mutual, scoped trust.
            </p>
          </div>
        </section>

        {/* The two peers */}
        <section className="mx-auto max-w-4xl px-4 py-12">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {[
              { name: 'Planner', org: 'Org One · AWS', cap: 'wants: search.query' },
              { name: 'Indexer', org: 'Org Two · GCP', cap: 'offers: search.query' },
            ].map((p) => (
              <div
                key={p.name}
                className="rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500/10 to-fd-card/40 p-5 text-center shadow-[0_0_16px_rgba(59,130,246,0.08)]"
              >
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500 dark:text-blue-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="font-semibold text-fd-foreground">{p.name}</div>
                <div className="text-xs text-fd-muted-foreground">{p.org}</div>
                <div className="mt-2 inline-block rounded-md bg-violet-500/10 px-2 py-0.5 font-mono text-[11px] text-violet-600 dark:text-violet-300">
                  {p.cap}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-4xl space-y-6 px-4 pb-16">
          <StepCard
            n="1"
            icon={<Search className="h-4 w-4" />}
            title="Discovery"
            rfc="RFC-AITP-0002"
            rfcHref="/spec/identity"
          >
            <p>
              Planner fetches Indexer&apos;s <strong>Manifest</strong> from its
              well-known endpoint. The manifest is a signed document that
              advertises Indexer&apos;s <strong>Agent Identifier (AID)</strong>,
              its public key, the capabilities it offers, and its handshake
              endpoint.
            </p>
            <p>
              Because the AID is <em>self-certifying</em> — derived from the
              public key itself — Planner can confirm the manifest was signed by
              the very key the AID commits to. No registrar, no DNS trust
              assumption.
            </p>
          </StepCard>

          <StepCard
            n="2"
            icon={<Fingerprint className="h-4 w-4" />}
            title="Identity, both directions"
            rfc="RFC-AITP-0004"
            rfcHref="/spec/mutual-handshake"
          >
            <p>
              Planner opens the handshake by sending a{' '}
              <code className="rounded bg-fd-primary/10 px-1 py-0.5 font-mono text-[12px] text-fd-primary">
                mutual_hello
              </code>{' '}
              — its own identity, a fresh nonce, and the grants it is requesting
              (<code className="font-mono text-[12px]">search.query</code>).
              Indexer replies with its own{' '}
              <code className="rounded bg-fd-primary/10 px-1 py-0.5 font-mono text-[12px] text-fd-primary">
                mutual_hello
              </code>
              . Now each side knows who the other claims to be — but not yet that
              they can prove it.
            </p>
          </StepCard>

          <StepCard
            n="3"
            icon={<KeyRound className="h-4 w-4" />}
            title="Proof of possession"
            rfc="RFC-AITP-0001"
            rfcHref="/spec/core"
          >
            <p>
              Each peer signs the other&apos;s nonce with its private key inside
              a{' '}
              <code className="rounded bg-fd-primary/10 px-1 py-0.5 font-mono text-[12px] text-fd-primary">
                mutual_commit
              </code>
              . Verifying that signature against the public key in the manifest
              proves the peer actually <em>holds</em> the key behind its AID —
              not just that it copied an identity from somewhere.
            </p>
            <p>
              The envelope signature covers the <strong>JCS-canonicalized</strong>{' '}
              envelope (everything except <code className="font-mono text-[12px]">signature</code>) under a
              domain tag, so both sides hash exactly the same thing, byte for
              byte.
            </p>
          </StepCard>

          <StepCard
            n="4"
            icon={<Ticket className="h-4 w-4" />}
            title="A pair of Trust Context Tokens"
            rfc="RFC-AITP-0005"
            rfcHref="/spec/tct"
          >
            <p>
              In the same{' '}
              <code className="rounded bg-fd-primary/10 px-1 py-0.5 font-mono text-[12px] text-fd-primary">
                mutual_commit
              </code>{' '}
              messages, each peer <strong>issues the other a TCT</strong>: a
              signed token that is <strong>audience-bound</strong> (only usable
              by the named peer), <strong>capability-scoped</strong> (exactly{' '}
              <code className="font-mono text-[12px]">search.query</code>, nothing
              more), and <strong>time-limited</strong>. The handshake ends with
              both agents holding a token they can verify offline against the
              peer that signed it.
            </p>
          </StepCard>

          <StepCard
            n="5"
            icon={<ShieldCheck className="h-4 w-4" />}
            title="A scoped capability call"
            rfc="RFC-AITP-0005"
            rfcHref="/spec/tct"
          >
            <p>
              Planner now calls{' '}
              <code className="font-mono text-[12px]">search.query</code> on
              Indexer, presenting its TCT. Indexer verifies the signature, the
              audience, the scope, and the expiry — and, where required, runs a
              proof-of-possession challenge so a stolen token alone isn&apos;t
              enough. A call without a valid TCT gets a{' '}
              <code className="font-mono text-[12px]">403</code>.
            </p>
          </StepCard>

          <StepCard
            n="6"
            icon={<Share2 className="h-4 w-4" />}
            title="Delegation, if needed"
            rfc="RFC-AITP-0006"
            rfcHref="/spec/delegation"
          >
            <p>
              Suppose Planner needs a third agent to fetch results on its behalf.
              It issues a <strong>delegation</strong> carrying a strict subset of
              what Indexer granted it — never more. Multi-hop chains attenuate at
              every step, so authority can only ever shrink as it travels.
            </p>
          </StepCard>

          <StepCard
            n="7"
            icon={<Ban className="h-4 w-4" />}
            title="Revocation"
            rfc="RFC-AITP-0008"
            rfcHref="/spec/revocation"
          >
            <p>
              If a key is compromised or a grant must be withdrawn, the issuer
              publishes a signed <strong>revocation list</strong>. Verifiers pull
              it (directly or via the Control Plane) and stop honoring the
              affected tokens — closing the loop without any agent ever having
              trusted a central authority.
            </p>
          </StepCard>
        </section>

        {/* Closing CTA */}
        <section className="border-t">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-fd-foreground sm:text-3xl">
              See it run for real
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-fd-muted-foreground">
              The Playground drives this exact flow with real LLM-powered agents.
              The spec defines every message down to the byte.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/playground"
                className="inline-flex items-center gap-2 rounded-lg border border-fd-primary/20 bg-fd-background px-6 py-3 text-sm font-semibold text-fd-foreground transition-all duration-200 hover:border-fd-primary/50 hover:shadow-[0_0_24px_rgba(59,130,246,0.2)]"
              >
                Open the Playground <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/spec/mutual-handshake"
                className="inline-flex items-center gap-2 rounded-lg border border-fd-primary/20 bg-fd-background px-6 py-3 text-sm font-semibold text-fd-foreground transition-all duration-200 hover:border-fd-primary/50 hover:shadow-[0_0_24px_rgba(59,130,246,0.2)]"
              >
                Read the Handshake RFC
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
